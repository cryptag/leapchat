package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func WSMessagesHandler(rooms *RoomManager) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// TODO: Get proper roomID based on auth token
		roomID := ""
		room := rooms.GetRoom(roomID)

		wsConn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			errStr := "Unable to upgrade to websocket conn"
			fullErr := errStr + ": " + err.Error()
			WriteError(w, errStr, errors.New(fullErr))
			return
		}
		client := &Client{
			wsConn:  wsConn,
			httpW:   w,
			httpReq: r,
		}
		room.AddClient(client)
		go messageReader(room, client)
	}
}

func messageReader(room *Room, client *Client) {
	// Send them already existing messages
	messages, err := room.GetMessages()
	if err != nil {
		WriteError(client.httpW, err.Error(), err)
		return
	}

	outgoing := OutgoingPayload{Ephemeral: messages}
	// TODO: Do more error handling
	jsonData, _ := json.Marshal(outgoing)
	client.wsConn.WriteMessage(websocket.TextMessage, jsonData)

	for {
		messageType, p, err := client.wsConn.ReadMessage()
		if err != nil {
			// TODO: Consider adding more checks
			log.Printf("Error reading ws message: %s", err)
			return
		}

		// Respond to message depending on message type
		switch messageType {
		case websocket.TextMessage:
			// TODO: Should this be blocking?
			// Steve: If saving to disk fails, log but don't fail
			msg := Message(p)

			saveMessageToDisk(msg)

			room.BroadcastMessages(client, msg)

		case websocket.BinaryMessage:
			log.Println("Binary messages are unsupported")

		case websocket.CloseMessage:
			log.Println("Got close message")
			room.RemoveClient(client)
			return

		default:
			log.Printf("Unsupport messageType: %d", messageType)

		}

	}
}

// TODO
func saveMessageToDisk(msg Message) error {
	return nil
}
