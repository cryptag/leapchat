package main

import (
	"errors"
	"net/http"
	"sync"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/websocket"
)

type Message []byte

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func WSMessagesHandler(rooms *RoomManager) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// TODO: Get proper authToken
		authToken := ""

		room, err := rooms.GetRoom(authToken)
		if err != nil {
			WriteError(w, err.Error(), err)
			return
		}

		wsConn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			errStr := "Unable to upgrade to websocket conn"
			fullErr := errStr + ": " + err.Error()
			WriteError(w, errStr, errors.New(fullErr))
			return
		}

		client := &Client{
			wsConn:    wsConn,
			writeLock: sync.Mutex{},
			httpW:     w,
			httpReq:   r,
			room:      room,
		}
		room.AddClient(client)

		go messageReader(room, client)
	}
}

func messageReader(room *Room, client *Client) {
	// Send them already existing messages
	err := client.wsConn.WriteJSON(
		OutgoingPayload{Ephemeral: room.GetMessages()},
	)
	if err != nil {
		WriteError(client.httpW, err.Error(), err)
		return
	}

	for {
		messageType, p, err := client.wsConn.ReadMessage()
		if err != nil {
			// TODO: Consider adding more checks
			log.Debugf("Error reading ws message: %s", err)
			return
		}

		// Respond to message depending on message type
		switch messageType {
		case websocket.TextMessage:
			msg := Message(p)
			go saveMessageToDisk(msg)
			room.AddMessages([]Message{msg})
			room.BroadcastMessages(client, msg)

		case websocket.BinaryMessage:
			log.Debug("Binary messages are unsupported")

		case websocket.CloseMessage:
			log.Debug("Got close message")
			room.RemoveClient(client)
			return

		default:
			log.Debugf("Unsupport messageType: %d", messageType)

		}

	}
}

// TODO: Save message to disk.
func saveMessageToDisk(msg Message) error {
	return nil
}
