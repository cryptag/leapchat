package main

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/cryptag/minishare/miniware"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/websocket"
	uuid "github.com/nu7hatch/gouuid"
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

			// TODO: Encrypt messages with ephemeral key, save to
			// disk, serve from disk rather than RAM
			//
			// go func() {
			// 	err := saveMessagesToDisk(payload.Ephemeral)
			// 	if err != nil {
			// 		log.Debugf("Error from saveMessagesToDisk: %v", err)
			// 	}
			// }()
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

func saveMessagesToDisk(msgs []Message) error {
	for i := 0; i < len(msgs); i++ {
		newUUID, err := uuid.NewV4()
		if err != nil {
			return err
		}

		filename := newUUID.String()

		err = ioutil.WriteFile(filename, msgs[i], 0600)
		if err != nil {
			return err
		}
	}
	return nil
}
