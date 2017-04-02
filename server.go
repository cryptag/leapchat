package main

import (
	"fmt"
	"html/template"
	"net/http"
	"time"

	log "github.com/Sirupsen/logrus"
	minilock "github.com/cathalgarvey/go-minilock"
	"github.com/cathalgarvey/go-minilock/taber"
	"github.com/cryptag/minishare/miniware"
	"github.com/gorilla/mux"
	uuid "github.com/nu7hatch/gouuid"
)

const (
	MINILOCK_ID_KEY = "minilock_id"
)

var (
	templates = template.Must(template.ParseFiles("index.html"))
)

func NewRouter(m *miniware.Mapper) *mux.Router {
	r := mux.NewRouter()

	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/",
		http.FileServer(http.Dir("./static")))).Methods("GET")
	r.PathPrefix("/build/").Handler(http.StripPrefix("/build/",
		http.FileServer(http.Dir("./build")))).Methods("GET")
	r.HandleFunc("/", GetIndex).Methods("GET")

	r.HandleFunc("/api/login", Login(m)).Methods("GET")

	msgsHandler := miniware.Auth(
		http.HandlerFunc(WSMessagesHandler(AllRooms)),
		m,
	)
	r.HandleFunc("/api/ws/messages/all", msgsHandler).Methods("GET")

	http.Handle("/", r)
	return r
}

func NewServer(m *miniware.Mapper, httpAddr string) *http.Server {
	r := NewRouter(m)
	return &http.Server{
		Addr:         httpAddr,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
		Handler:      r,
	}
}

func GetIndex(w http.ResponseWriter, req *http.Request) {
	_ = templates.ExecuteTemplate(w, "index.html", nil)
}

func Login(m *miniware.Mapper) func(w http.ResponseWriter, req *http.Request) {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		mID, keypair, err := parseMinilockID(req)
		if err != nil {
			WriteErrorStatus(w, "Error: invalid miniLock ID",
				err, http.StatusBadRequest)
			return
		}

		log.Infof("Login: `%s` is trying to log in\n", mID)

		newUUID, err := uuid.NewV4()
		if err != nil {
			WriteError(w, "Error generating now auth token; sorry!", err)
			return
		}

		authToken := newUUID.String()

		err = m.SetMinilockID(authToken, mID)
		if err != nil {
			WriteError(w, "Error saving new auth token; sorry!", err)
			return
		}

		filename := "type:authtoken"
		contents := []byte(authToken)
		sender := randomServerKey
		recipient := keypair

		encAuthToken, err := minilock.EncryptFileContents(filename, contents,
			sender, recipient)
		if err != nil {
			WriteError(w, "Error encrypting auth token to you; sorry!", err)
			return
		}

		w.Write(encAuthToken)
	})
}

func parseMinilockID(req *http.Request) (string, *taber.Keys, error) {
	mID := req.Header.Get("X-Minilock-Id")

	// Validate miniLock ID by trying to generate public key from it
	keypair, err := taber.FromID(mID)
	if err != nil {
		return "", nil, fmt.Errorf("Error validating miniLock ID: %v", err)
	}

	return mID, keypair, nil
}
