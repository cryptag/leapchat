package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// TODO: Create operation for creating new rooms
var AllRooms = NewRoomManager()

var (
	ErrRoomNotFound = errors.New("Error: Room not found")
)

type RoomManager struct {
	mu    sync.RWMutex
	rooms map[string]*Room // map[miniLockID]*Room
}

func NewRoomManager() *RoomManager {
	return &RoomManager{
		rooms: map[string]*Room{},
	}
}

func (rm *RoomManager) GetRoom(token string) (*Room, error) {
	rm.mu.RLock()
	defer rm.mu.RUnlock()

	room, ok := rm.rooms[token]
	if !ok {
		return nil, ErrRoomNotFound
	}
	return room, nil
}

type Message []byte

type Room struct {
	ID       string // miniLock ID
	Clients  []*Client
	messages []Message

	clientLock sync.RWMutex
	msgLock    sync.RWMutex
}

// TODO
func (r *Room) GetMessages() ([]Message, error) {
	r.msgLock.Lock()
	defer r.msgLock.Unlock()

	newMsgs := make([]Message, len(r.messages))
	copy(newMsgs, r.messages)
	return newMsgs, nil
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
	// TODO: Distribute client joined message
	// r.BroadcastMessages()
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
	// TODO: Distribute client left message
	// r.BroadcastMessages()
}

// If it is a message from the room, make the sender nil.
func (r *Room) BroadcastMessages(sender *Client, msgs ...Message) {
	for _, msg := range msgs {
		for _, client := range r.Clients {
			if client != sender {
				client.SendMessages(msg)
			}
		}
	}
}

type Client struct {
	wsConn *websocket.Conn

	httpW   http.ResponseWriter
	httpReq *http.Request
}

type OutgoingPayload struct {
	Ephemeral []Message `json:"ephemeral"`
}

func (c *Client) SendMessages(msgs ...Message) error {
	outgoing := OutgoingPayload{Ephemeral: msgs}

	body, err := json.Marshal(outgoing)
	if err != nil {
		return err
	}

	err = c.wsConn.WriteMessage(websocket.TextMessage, body)
	if err != nil {
		// TODO: Remove client from room
		return err
	}

	return nil
}
