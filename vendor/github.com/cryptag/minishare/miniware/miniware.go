// Steve Phillips / elimisteve
// 2017.04.01

package miniware

import (
	"errors"
	"fmt"
	"net/http"
	"sync"
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/cathalgarvey/go-minilock/taber"
	gorillacontext "github.com/gorilla/context"
	"github.com/gorilla/websocket"
)

const (
	MINILOCK_ID_KEY      = "minilock_id"
	MINILOCK_KEYPAIR_KEY = "minilock_keypair"
	WEBSOCKET_CONNECTION = "websocket_connection"

	AuthError = "Error authorizing you"
)

var (
	ErrAuthTokenNotFound  = errors.New("Auth token not found")
	ErrMinilockIDNotFound = errors.New("miniLock ID not found")
)

type Mapper struct {
	lock sync.RWMutex
	m    map[string]string // map[authToken]minilockID
}

func NewMapper() *Mapper {
	return &Mapper{m: map[string]string{}}
}

func (m *Mapper) GetMinilockID(authToken string) (string, error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	mID, ok := m.m[authToken]
	if !ok {
		return "", ErrAuthTokenNotFound
	}
	return mID, nil
}

func (m *Mapper) SetMinilockID(authToken, mID string) error {
	m.lock.Lock()
	defer m.lock.Unlock()

	m.m[authToken] = mID
	return nil
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func Auth(h http.Handler, m *Mapper) func(w http.ResponseWriter, req *http.Request) {
	return func(w http.ResponseWriter, req *http.Request) {
		wsConn, err := upgrader.Upgrade(w, req, nil)
		if err != nil {
			errStr := "Unable to upgrade to websocket conn"
			log.Debug(errStr + ": " + err.Error())
			writeError(w, errStr, http.StatusBadRequest)
			return
		}

		var authToken string

		auth := make(chan interface{})

		go func() {
			messageType, p, err := wsConn.ReadMessage()
			if err != nil {
				auth <- err
				return
			}
			log.Debugf("Received message of type %v: `%s`", messageType, p)
			if messageType != websocket.TextMessage {
				auth <- fmt.Errorf("Wanted type %v (TextMessage), got %v",
					websocket.TextMessage, messageType)
				return
			}
			auth <- string(p)
		}()

		timeout := time.After(5 * time.Second)
		select {
		case <-timeout:
			errStr := "Timed out; didn't send miniLock ID/room ID fast enough"
			writeWSError(wsConn, errStr)
			return

		case token := <-auth:
			switch maybeToken := token.(type) {
			case error:
				errStr := maybeToken.Error()
				writeWSError(wsConn, errStr)
				return

			case string:
				authToken = maybeToken

				// FALL THROUGH
			}
		}

		mID, err := m.GetMinilockID(authToken)
		if err != nil {
			status := http.StatusInternalServerError
			if err == ErrAuthTokenNotFound {
				status = http.StatusUnauthorized
			}
			log.Debugf("%v error from GetMinilockID: %v", status, err)
			writeWSError(wsConn, AuthError)
			return
		}

		log.Infof("`%s` just authed successfully; auth token: `%s`\n", mID,
			authToken)

		// TODO: Update auth token's TTL/lease to be 1 hour from
		// _now_, not just 1 hour since when they first logged in

		keypair, err := taber.FromID(mID)
		if err != nil {
			log.Debugf("Error from GetMinilockID: %v", err)
			writeWSError(wsConn, "Your miniLock ID is invalid?...")
			return
		}

		gorillacontext.Set(req, MINILOCK_ID_KEY, mID)
		gorillacontext.Set(req, MINILOCK_KEYPAIR_KEY, keypair)
		gorillacontext.Set(req, WEBSOCKET_CONNECTION, wsConn)

		h.ServeHTTP(w, req)
	}
}

func GetMinilockID(req *http.Request) (string, error) {
	mID := gorillacontext.Get(req, MINILOCK_ID_KEY)
	mIDStr, ok := mID.(string)
	if !ok {
		return "", ErrMinilockIDNotFound
	}
	return mIDStr, nil
}

func GetWebsocketConn(req *http.Request) (*websocket.Conn, error) {
	wsConnInterface := gorillacontext.Get(req, WEBSOCKET_CONNECTION)
	wsConn, ok := wsConnInterface.(*websocket.Conn)
	if !ok {
		return nil, ErrMinilockIDNotFound
	}
	return wsConn, nil
}

func writeWSError(wsConn *websocket.Conn, errStr string) error {
	log.Debug(errStr)
	resp := fmt.Sprintf(`{"error":%q}`, errStr)
	err := wsConn.WriteMessage(websocket.TextMessage, []byte(resp))
	wsConn.Close()
	return err
}

func writeError(w http.ResponseWriter, errStr string, statusCode int) {
	errJSON := fmt.Sprintf(`{"error":%q}`, errStr)
	http.Error(w, errJSON, statusCode)
}
