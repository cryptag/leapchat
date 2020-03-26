package main

import (
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"sync"
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/websocket"
)

const (
	POSTGREST_BASE_URL = "http://localhost:3000"
)

var (
	DELETE_EXPIRED_MESSAGES_PERIOD = 10 * time.Minute

	pgClient = NewPGClient(POSTGREST_BASE_URL)
	AllRooms = NewRoomManager(pgClient)
)

type RoomManager struct {
	lock  sync.RWMutex
	rooms map[string]*Room // map[miniLockID]*Room

	pgClient *PGClient
}

func NewRoomManager(pgClient *PGClient) *RoomManager {
	go func() {
		tick := time.Tick(DELETE_EXPIRED_MESSAGES_PERIOD)
		var err error
		for {
			err = pgClient.PostWanted("/rpc/delete_expired_messages", nil,
				http.StatusOK)
			if err != nil {
				log.Infof("Error deleting expired messages: %v", err)
			} else {
				log.Debugf("Just deleted expired messages")
			}
			<-tick
		}
	}()
	return &RoomManager{
		pgClient: pgClient,
		rooms:    map[string]*Room{},
	}
}

func (rm *RoomManager) GetRoom(roomID string) *Room {
	rm.lock.Lock()
	defer rm.lock.Unlock()

	room, ok := rm.rooms[roomID]
	if !ok {
		room = NewRoom(roomID, rm.pgClient)
		rm.rooms[roomID] = room
	}
	return room
}

type Room struct {
	ID string // miniLock ID

	Clients    []*Client
	clientLock sync.RWMutex

	pgClient *PGClient
}

func NewRoom(roomID string, pgClient *PGClient) *Room {
	// TODO: Error handling
	_ = PGRoom{RoomID: roomID}.Create(pgClient)
	return &Room{
		ID:       roomID,
		pgClient: pgClient,
	}
}

func (r *Room) GetMessages() ([]Message, error) {
	var pgMessages PGMessages
	err := r.pgClient.GetInto(
		"/messages?select=message_enc&order=created.desc&limit=100&room_id=eq."+r.ID,
		&pgMessages)
	if err != nil {
		return nil, err
	}

	msgs := make([]Message, len(pgMessages))

	var bindata []byte

	// Grab just the message_enc field, reverse the order, and turn
	// PostgREST's hex string response back into base64
	for i := 0; i < len(pgMessages); i++ {
		bindata, err = byteaToBytes(pgMessages[i].MessageEnc)
		if err != nil {
			log.Debugf("Error from byteaToBytes: %s", err)
			continue
		}
		msgs[len(pgMessages)-i-1] = bindata
	}

	return msgs, nil
}

func (r *Room) AddMessages(msgs []Message, ttlSecs *int) error {
	post := make(PGMessages, len(msgs))

	for i := 0; i < len(msgs); i++ {
		post[i] = &PGMessage{
			RoomID:     r.ID,
			MessageEnc: string(msgs[i]),
			TTL:        ttlSecs,
		}
	}

	return post.Create(r.pgClient)
}

func byteaToBytes(hexdata string) ([]byte, error) {
	if len(hexdata) <= 2 {
		return []byte{}, nil
	}

	// Postgres prefixes the stored strings with "\\x"
	hexdatab := []byte(hexdata[2:])

	b64b := make([]byte, hex.DecodedLen(len(hexdatab)))
	n, err := hex.Decode(b64b, hexdatab)
	if err != nil {
		return nil, err
	}

	bindata := make([]byte, base64.StdEncoding.DecodedLen(len(b64b)))
	n, err = base64.StdEncoding.Decode(bindata, b64b)
	if err != nil {
		return nil, err
	}

	return bindata[:n], nil
}

func (r *Room) AddClient(c *Client) {
	r.clientLock.Lock()
	defer r.clientLock.Unlock()

	r.Clients = append(r.Clients, c)
}

func (r *Room) RemoveClient(c *Client) {
	r.clientLock.Lock()
	defer r.clientLock.Unlock()

	for i, client := range r.Clients {
		if client == c {
			r.Clients = append(r.Clients[:i], r.Clients[i+1:]...)
			client.wsConn.Close()
			break
		}
	}
}

// If it is a message from the room, make the sender nil.
func (r *Room) BroadcastMessages(sender *Client, msgs ...Message) {
	r.clientLock.RLock()
	defer r.clientLock.RUnlock()

	for _, client := range r.Clients {
		go func(client *Client) {
			err := client.SendMessages(msgs...)
			if err != nil {
				log.Debugf("Error sending message. Err: %s", err)
			}
		}(client)
	}
}

type Client struct {
	wsConn    *websocket.Conn
	writeLock sync.Mutex

	room *Room
}

func (c *Client) SendMessages(msgs ...Message) error {
	c.writeLock.Lock()
	defer c.writeLock.Unlock()

	outgoing := OutgoingPayload{Ephemeral: msgs}

	body, err := json.Marshal(outgoing)
	if err != nil {
		return err
	}

	err = c.wsConn.WriteMessage(websocket.TextMessage, body)
	if err != nil {
		log.Debugf("Error sending message to client. Removing client from room. Err: %s", err)
		c.room.RemoveClient(c)
		return err
	}

	return nil
}

func (c *Client) SendError(errStr string, secretErr error) error {
	c.writeLock.Lock()
	defer c.writeLock.Unlock()

	return WSWriteError(c.wsConn, errStr, secretErr)
}
