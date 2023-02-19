package main

import (
	"encoding/json"
	"net/http"

	"github.com/cryptag/leapchat/miniware"
	"github.com/gorilla/websocket"
	log "github.com/sirupsen/logrus"
)

type Message []byte

type TodoList struct {
	TitleEnc string `json:"title_enc"` // base64-encoded, encrypted title
}

type OutgoingPayload struct {
	Ephemeral  []Message  `json:"ephemeral"`
	FromServer FromServer `json:"from_server,omitempty"`
}

type FromServer struct {
	AllMessagesDeleted bool `json:"all_messages_deleted,omitempty"`
}

type ToServer struct {
	TTL               *int `json:"ttl_secs"`
	DeleteAllMessages bool `json:"delete_all_messages"`
}

type IncomingPayload struct {
	Ephemeral []Message  `json:"ephemeral"`
	TodoLists []TodoList `json:"todo_lists"`
	// Tasks     []string   `json:"tasks"`
	ToServer ToServer `json:"to_server"`
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

			if payload.ToServer.DeleteAllMessages {
				err = room.DeleteAllMessages()
				if err != nil {
					room.BroadcastMessages(client, Message(err.Error()))
					log.Errorf("Error deleting all messages from room %s -- %s", room.ID, err)
					continue
				}
				room.BroadcastDeleteSignal()
				continue
			}

			if len(payload.Ephemeral) > 0 {
				err = room.AddMessages(payload.Ephemeral, payload.ToServer.TTL)
				if err != nil {
					log.Debugf("Error from AddMessages: %v", err)
					continue
				}
			}

			if len(payload.TodoLists) > 0 {
				jsonToBroadcast, err := room.AddTodoLists(payload.TodoLists)
				if err != nil {
					log.Debugf("Error from AddTodoLists: %v", err)
					continue
				}
				room.BroadcastJSON(client, jsonToBroadcast)
			}

			// if len(payload.Tasks) > 0 {
			// 	err = room.AddTasks(payload.Tasks)
			// 	if err != nil {
			// 		log.Debugf("Error from AddTasks: %v", err)
			// 		continue
			// 	}
			// }

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
