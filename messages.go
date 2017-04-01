package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type Message struct {
	Message string `json:"message"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func WSMessagesHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: Get proper authToken
	authToken := ""
	room := getRoom(authToken)
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Unable to upgrade to websocket conn: %s", err)
		return
	}
	client := &Client{conn: conn}
	room.AddClient(client)
	go messageReader(room, client)
}

func messageReader(room *Room, client *Client) {
	// TODO: Send them already existing messages
	// messages := GetMessages()
	for {
		messageType, p, err := client.conn.ReadMessage()
		if err != nil {
			log.Printf("Error reading ws message: %s", err)
			return
		}

		// Respond to message depending on message type
		switch messageType {
		case websocket.TextMessage:
			var msg Message
			err := json.Unmarshal(p, msg)
			if err != nil {
				log.Printf("Error unmarshalling message: %s", err)
				continue
			}

			// TODO: Should this be blocking?
			// Steve: If saving to disk fails, log but don't fail
			saveMessageToDisk(msg)

			room.NewMessage(client, msg)

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
