package main

import (
	"encoding/json"
	"sync"

	"github.com/gorilla/websocket"
)

// TODO: Create operation for creating new rooms
var ROOMS map[string]*Room

type Room struct {
	Messages []string
	Clients  []*Client
	ID       string

	clientRWLock sync.RWMutex
}

func getRoom(token string) *Room {
	return ROOMS[token]
}

// TODO
func (r *Room) GetMessages() ([]Message, error) {
	return []Message{}, nil
}

func (r *Room) AddClient(c *Client) {
	r.clientRWLock.Lock()
	defer r.clientRWLock.Unlock()
	r.Clients = append(r.Clients, c)
	// TODO: Distribute client joined message
	// r.NewMessage()
}

func (r *Room) RemoveClient(c *Client) {
	r.clientRWLock.Lock()
	defer r.clientRWLock.Unlock()

	for i, client := range r.Clients {
		if client == c {
			r.Clients = append(r.Clients[:i], r.Clients[i+1:]...)
			return
		}
	}
	// TODO: Distribute client left message
	// r.NewMessage()
}

// If it is a message from the room, make the sender nil.
func (r *Room) NewMessage(sender *Client, msg Message) {
	for _, client := range r.Clients {
		if client != sender {
			client.SendMessage(msg)
		}
	}
}

type Client struct {
	conn *websocket.Conn
}

func (c *Client) SendMessage(msg Message) error {
	body, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	err = c.conn.WriteMessage(websocket.TextMessage, body)
	if err != nil {
		return err
	}

	return nil
}
