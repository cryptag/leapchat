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

func (cl *PGClient) Post(urlSuffix string, payload interface{}) (*http.Response, error) {
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
	// req.Header.Add("Prefer", "return=representation")
	req.Header.Add("Prefer", "return=none")
	req.Header.Add("Content-Type", "application/json")

	return http.DefaultClient.Do(req)
}

func (cl *PGClient) PostWanted(urlSuffix string, payload interface{}, statusWanted int) error {
	resp, err := cl.Post(urlSuffix, payload)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != statusWanted {
		body, _ := ioutil.ReadAll(resp.Body)

		respjson := map[string]interface{}{}
		err = json.Unmarshal(body, &respjson)
		return fmt.Errorf(
			"Got HTTP %v from PostgREST, wanted %v. Resp: %#v (err unmarshal: %v)",
			resp.StatusCode, statusWanted, respjson, err)
	}

	return nil
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
	return cl.PostWanted("/rooms", room, http.StatusCreated)
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

func (msgs PGMessages) Create(pgClient *PGClient) error {
	// TODO: Parse resp.Body as []*PGMessage, return to user
	return pgClient.PostWanted("/messages", msgs, http.StatusCreated)
}
