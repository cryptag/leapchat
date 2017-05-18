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

type ToServer struct {
	TTL *int `json:"ttl_secs"`
}

type IncomingPayload struct {
	Ephemeral []Message `json:"ephemeral"`
	ToServer  ToServer  `json:"to_server"`
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
	msgs, err := room.GetMessages()
	if err != nil {
		client.SendError(err.Error(), err)
		return
	}

	// Send them already-existing messages
	err = client.SendMessages(msgs...)
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

			err = room.AddMessages(payload.Ephemeral, payload.ToServer.TTL)
			if err != nil {
				log.Debugf("Error from AddMessages: %v", err)
				continue
			}

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
