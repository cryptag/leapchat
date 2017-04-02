package main

import (
	"encoding/json"
	"sync"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/websocket"
)

var AllRooms = NewRoomManager()

type RoomManager struct {
	lock  sync.RWMutex
	rooms map[string]*Room // map[miniLockID]*Room
}

func NewRoomManager() *RoomManager {
	return &RoomManager{
		rooms: map[string]*Room{},
	}
}

func (rm *RoomManager) GetRoom(roomID string) *Room {
	rm.lock.Lock()
	defer rm.lock.Unlock()

	room, ok := rm.rooms[roomID]
	if !ok {
		newRoom := NewRoom(roomID)
		rm.rooms[roomID] = newRoom
		return newRoom
	}
	return room
}

type Room struct {
	ID       string // miniLock ID
	Clients  []*Client
	messages []Message

	clientLock sync.RWMutex
	msgLock    sync.RWMutex
}

func NewRoom(roomID string) *Room {
	return &Room{
		ID:       roomID,
		messages: []Message{}, // So that they marshal to `[]`, not `null`
	}
}

func (r *Room) GetMessages() []Message {
	r.msgLock.RLock()
	defer r.msgLock.RUnlock()

	newMsgs := make([]Message, len(r.messages))
	copy(newMsgs, r.messages)
	return newMsgs
}

func (r *Room) AddMessages(msgs []Message) {
	r.msgLock.Lock()
	defer r.msgLock.Unlock()

	r.messages = append(r.messages, msgs...)
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
			break
		}
	}
}

// If it is a message from the room, make the sender nil.
func (r *Room) BroadcastMessages(sender *Client, msgs ...Message) {
	r.clientLock.RLock()
	defer r.clientLock.RUnlock()

	for _, client := range r.Clients {
		if client != sender {
			go func(client *Client) {
				err := client.SendMessages(msgs...)
				if err != nil {
					log.Debugf("Error sending message. Err: %s", err)
				}
			}(client)
		}
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
