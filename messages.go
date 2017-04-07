package main

import (
	"encoding/json"
	"net/http"

	"github.com/cryptag/minishare/miniware"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/websocket"
)

type Message []byte

type OutgoingPayload struct {
	Ephemeral []Message `json:"ephemeral"`
}

type IncomingPayload struct {
	Ephemeral []Message `json:"ephemeral"`
}

func WSMessagesHandler(rooms *RoomManager) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// Both guaranteed by middleware
		wsConn, _ := miniware.GetWebsocketConn(r)
		roomID, _ := miniware.GetMinilockID(r)

		room := rooms.GetRoom(roomID)

		client := &Client{
			wsConn: wsConn,
			room:   room,
		}
		room.AddClient(client)

		go messageReader(room, client)
	}
}

func messageReader(room *Room, client *Client) {
	// Send them already-existing messages
	err := client.SendMessages(room.GetMessages()...)
	if err != nil {
		client.SendError(err.Error(), err)
		return
	}

	for {
		messageType, p, err := client.wsConn.ReadMessage()
		if err != nil {
			// TODO: Consider adding more checks
			log.Debugf("Error reading ws message: %s", err)
			room.RemoveClient(client)
			return
		}

		// Respond to message depending on message type
		switch messageType {
		case websocket.TextMessage:
			var payload IncomingPayload
			err := json.Unmarshal(p, &payload)
			if err != nil {
				log.Debugf("Error unmarshalling message `%s` -- %s", p, err)
				continue
			}

			go saveMessagesToDisk(payload.Ephemeral)
			room.AddMessages(payload.Ephemeral)
			room.BroadcastMessages(client, payload.Ephemeral...)

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
func saveMessagesToDisk(msg []Message) error {
	return nil
}
