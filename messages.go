package main

import (
	"encoding/json"
	"errors"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/cryptag/minishare/miniware"
	gorillacontext "github.com/gorilla/context"
	"github.com/gorilla/websocket"
)

type Message []byte

type OutgoingPayload struct {
	Ephemeral []Message `json:"ephemeral"`
}

type IncomingPayload struct {
	Ephemeral []Message `json:"ephemeral"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func WSMessagesHandler(rooms *RoomManager) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// Guaranteed by middleware
		roomID := gorillacontext.Get(r, miniware.MINILOCK_ID_KEY).(string)

		room := rooms.GetRoom(roomID)

		wsConn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			errStr := "Unable to upgrade to websocket conn"
			fullErr := errStr + ": " + err.Error()
			WriteError(w, errStr, errors.New(fullErr))
			return
		}

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
				log.Debugf("Error unmarshalling message. Err: %s", err)
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
