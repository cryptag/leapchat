package main

import (
	"fmt"
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRoomManager(t *testing.T) {
	rooms := NewRoomManager(pgClient)
	roomIDs := []string{}
	wg := &sync.WaitGroup{}

	for i := 0; i < 10; i++ {
		roomID := fmt.Sprintf("room-%d", i)
		roomIDs = append(roomIDs, roomID)

		wg.Add(1)
		go func(roomID string) {
			rooms.GetRoom(roomID)
			wg.Done()
		}(roomID)
	}

	wg.Wait()
	for _, roomID := range roomIDs {
		assert.NotNil(t, rooms.rooms[roomID], fmt.Sprintf("RoomID: %v\nRooms: %v\n", roomID, rooms))
	}
}

func TestRoomMessages(t *testing.T) {
	r := NewRoom("testing-room-testing-room-testing-room-testing", pgClient)
	wg := &sync.WaitGroup{}

	msgs := [][]Message{}
	expectedMsgs := []Message{}
	for i := 0; i < 10; i++ {
		msgs = append(msgs, []Message{})
		for n := 0; n < 10; n++ {
			msgs[i] = append(msgs[i], Message{'a'})
			expectedMsgs = append(expectedMsgs, Message{'a'})
		}
	}

	wg.Add(len(msgs) * 2)
	ttlSecs := 60
	for i := 0; i < 10; i++ {
		go func(i int) {
			err := r.AddMessages(msgs[i], &ttlSecs)
			if err != nil {
				t.Logf("Error from AddMessages: %s", err)
			}
			wg.Done()
		}(i)

		go func() {
			_, err := r.GetMessages()
			if err != nil {
				t.Logf("Error from GetMessages: %s", err)
			}
			wg.Done()
		}()
	}

	wg.Wait()

	gotMsgs, _ := r.GetMessages()
	assert.Equal(t, expectedMsgs, gotMsgs)
}

func TestRoomClients(t *testing.T) {
	r := NewRoom("testing-room-testing-room-testing-room-testing", pgClient)
	clients := []*Client{}
	wg := &sync.WaitGroup{}

	for i := 0; i < 10; i++ {
		client := &Client{}
		clients = append(clients, client)

		wg.Add(1)
		go func(c *Client) {
			r.AddClient(c)
			wg.Done()
		}(client)
	}

	wg.Wait()
	assert.Equal(t, clients, r.Clients)

	for _, client := range clients {
		wg.Add(1)
		go func(c *Client) {
			r.RemoveClient(c)
			wg.Done()
		}(client)
	}

	wg.Wait()
	assert.Empty(t, r.Clients)
}

// TODO
func TestRoomBroadcastMessages(t *testing.T) {}
