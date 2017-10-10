// Steve Phillips / elimisteve
// 2017.05.18

package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	log "github.com/Sirupsen/logrus"
)

type PGClient struct {
	BaseURL string
}

func NewPGClient(baseURL string) *PGClient {
	return &PGClient{
		BaseURL: baseURL,
	}
}

func (cl *PGClient) Post(urlSuffix string, payload interface{}, returning ...string) (*http.Response, error) {
	var payloadb []byte
	if payload != nil {
		b, err := json.Marshal(payload)
		if err != nil {
			return nil, err
		}
		payloadb = b
	}

	log.Debugf("POST'ing to %s: %s", urlSuffix, payloadb)

	r := bytes.NewReader(payloadb)
	req, _ := http.NewRequest("POST", cl.BaseURL+urlSuffix, r)

	columnsWanted := "none"
	if len(returning) > 0 {
		columnsWanted = returning[0]
	}
	req.Header.Add("Prefer", "return="+columnsWanted)

	req.Header.Add("Content-Type", "application/json")

	return http.DefaultClient.Do(req)
}

func (cl *PGClient) PostWanted(urlSuffix string, payload interface{}, statusWanted int, returning ...string) (*http.Response, error) {
	resp, err := cl.Post(urlSuffix, payload, returning...)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != statusWanted {
		defer resp.Body.Close()

		body, _ := ioutil.ReadAll(resp.Body)

		respjson := map[string]interface{}{}
		err = json.Unmarshal(body, &respjson)
		return nil, fmt.Errorf(
			"Got HTTP %v from PostgREST, wanted %v. Resp: %#v (err unmarshal: %v)",
			resp.StatusCode, statusWanted, respjson, err)
	}

	return resp, nil
}

func (cl *PGClient) PostWantedInto(urlSuffix string, payload interface{}, statusWanted int, pgType interface{}, returning ...string) error {
	resp, err := cl.PostWanted(urlSuffix, payload, statusWanted, returning...)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	return json.Unmarshal(body, pgType)
}

func (cl *PGClient) Get(urlSuffix string) (*http.Response, error) {
	log.Debugf("GET'ing from %s", urlSuffix)

	req, _ := http.NewRequest("GET", cl.BaseURL+urlSuffix, nil)
	// req.Header.Add("Prefer", "return=representation")
	req.Header.Add("Prefer", "return=none")
	req.Header.Add("Content-Type", "application/json")

	return http.DefaultClient.Do(req)
}

func (cl *PGClient) GetInto(urlSuffix string, respobj interface{}) error {
	resp, err := cl.Get(urlSuffix)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	statusWanted := http.StatusOK

	body, _ := ioutil.ReadAll(resp.Body)

	if resp.StatusCode != statusWanted {
		respjson := map[string]interface{}{}
		err = json.Unmarshal(body, &respjson)
		return fmt.Errorf(
			"Got HTTP %v from PostgREST, wanted %v. Resp: %#v (err unmarshal: %v)",
			resp.StatusCode, statusWanted, respjson, err)
	}

	return json.Unmarshal(body, respobj)
}

type PGRoom struct {
	RoomID string `json:"room_id"`
}

func (room PGRoom) Create(cl *PGClient) error {
	resp, err := cl.PostWanted("/rooms", room, http.StatusCreated)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}

type PGMessage struct {
	MessageID  string     `json:"message_id,omitempty"`
	RoomID     string     `json:"room_id"`
	Message    string     `json:"message,omitempty"`
	MessageEnc string     `json:"message_enc"`
	TTL        *int       `json:"ttl_secs,omitempty"`
	Created    *time.Time `json:"created,omitempty"`
}

type pgPostMessage PGMessage

func (msg *PGMessage) MarshalJSON() ([]byte, error) {
	m := pgPostMessage(*msg)
	// Store binary data in Postgres base64-encoded
	m.MessageEnc = base64.StdEncoding.EncodeToString([]byte(m.MessageEnc))
	return json.Marshal(m)
}

type PGMessages []*PGMessage

func (msgs PGMessages) Create(pgClient *PGClient) (PGMessages, error) {
	// TODO: Parse resp.Body as []*PGMessage, return to user
	dbMsgs := make(PGMessages, len(msgs))
	err := pgClient.PostWantedInto("/messages", msgs,
		http.StatusCreated, dbMsgs, "message_id,created")
	if err != nil {
		return msgs, err
	}

	for i := 0; i < len(dbMsgs); i++ {
		msgs[i].MessageID = dbMsgs[i].MessageID
		msgs[i].Created = dbMsgs[i].Created
	}

	return msgs, nil
}
