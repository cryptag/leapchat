package main

import (
	"crypto/tls"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/cryptag/gosecure/canary"
	"github.com/cryptag/gosecure/content"
	"github.com/cryptag/gosecure/csp"
	"github.com/cryptag/gosecure/frame"
	"github.com/cryptag/gosecure/hsts"
	"github.com/cryptag/gosecure/referrer"
	"github.com/cryptag/gosecure/xss"
	"github.com/cryptag/minishare/miniware"

	log "github.com/Sirupsen/logrus"
	minilock "github.com/cathalgarvey/go-minilock"
	"github.com/cathalgarvey/go-minilock/taber"
	"github.com/gorilla/mux"
	"github.com/justinas/alice"
	uuid "github.com/nu7hatch/gouuid"
	"golang.org/x/crypto/acme/autocert"
)

const (
	MINILOCK_ID_KEY = "minilock_id"
)

func NewRouter(m *miniware.Mapper) *mux.Router {
	r := mux.NewRouter()

	// pgClient defined in room.go
	r.HandleFunc("/api/login", Login(m, pgClient)).Methods("GET")

	msgsHandler := miniware.Auth(
		http.HandlerFunc(WSMessagesHandler(AllRooms)),
		m,
	)
	r.HandleFunc("/api/ws/messages/all", msgsHandler).Methods("GET")

	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./" + BUILD_DIR))).Methods("GET")

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

func ProductionServer(srv *http.Server, httpsAddr, domain string, manager *autocert.Manager, iframeOrigin string) {
	gotWarrant := false
	middleware := alice.New(canary.GetHandler(&gotWarrant),
		csp.GetCustomHandlerStyleUnsafeInline(domain, domain),
		hsts.PreloadHandler, frame.GetHandler(iframeOrigin),
		content.GetHandler, xss.GetHandler, referrer.NoHandler)

	srv.Handler = middleware.Then(manager.HTTPHandler(srv.Handler))

	srv.Addr = httpsAddr
	srv.TLSConfig = getTLSConfig(domain, manager)
}

func Login(m *miniware.Mapper, pgClient *PGClient) func(w http.ResponseWriter, req *http.Request) {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		mID, keypair, err := parseMinilockID(req)
		if err != nil {
			WriteErrorStatus(w, "Error: invalid miniLock ID",
				err, http.StatusBadRequest)
			return
		}

		err = PGRoom{RoomID: mID}.Create(pgClient)
		if err != nil && !strings.Contains(err.Error(),
			"duplicate key value violates unique constraint") {

			WriteErrorStatus(w, "Error creating new room",
				err, http.StatusInternalServerError)
			return
		}

		log.Infof("Login: `%s` is trying to log in\n", mID)

		newUUID, err := uuid.NewV4()
		if err != nil {
			WriteError(w, "Error generating new auth token; sorry!", err)
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

func redirectToHTTPS(httpAddr, httpsPort string, manager *autocert.Manager) {
	srv := &http.Server{
		Addr:         httpAddr,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
		IdleTimeout:  5 * time.Second,
		Handler: manager.HTTPHandler(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			w.Header().Set("Connection", "close")
			domain := strings.SplitN(req.Host, ":", 2)[0]
			url := "https://" + domain + ":" + httpsPort + req.URL.String()
			http.Redirect(w, req, url, http.StatusFound)
		})),
	}
	log.Infof("Listening on %v\n", httpAddr)
	log.Fatal(srv.ListenAndServe())
}

func getAutocertManager(domain string) *autocert.Manager {
	return &autocert.Manager{
		Prompt:     autocert.AcceptTOS,
		HostPolicy: autocert.HostWhitelist(domain),
		Cache:      autocert.DirCache("./" + domain),
	}
}

func getTLSConfig(domain string, manager *autocert.Manager) *tls.Config {
	return manager.TLSConfig()
}
