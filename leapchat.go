package main

import (
	"flag"
	"html/template"
	"net/http"
	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
)

func init() {
	log.SetLevel(log.DebugLevel)
}

func main() {
	httpAddr := flag.String("http", "127.0.0.1:8000",
		"Address to listen on HTTP")
	prod := flag.Bool("prod", false, "Run in Production mode.")
	flag.Parse()

	if *prod {
		log.SetLevel(log.FatalLevel)
	}

	r := mux.NewRouter()

	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/",
		http.FileServer(http.Dir("./static")))).Methods("GET")
	r.PathPrefix("/build/").Handler(http.StripPrefix("/build/",
		http.FileServer(http.Dir("./build")))).Methods("GET")

	r.HandleFunc("/", GetIndex).Methods("GET")
	// r.HandleFunc("/api/login", Login).Methods("GET")
	// r.HandleFunc("/api/messages", miniware.Auth(Login)).Methods("GET")
	r.HandleFunc("/api/ws/messages/all", WSMessagesHandler(AllRooms)).Methods("GET")

	http.Handle("/", r)

	srv := &http.Server{
		Addr:         *httpAddr,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
		Handler:      r,
	}
	log.Infof("Listening on %v", *httpAddr)
	log.Fatal(srv.ListenAndServe())
}

var templates = template.Must(template.ParseFiles("index.html"))

func GetIndex(w http.ResponseWriter, req *http.Request) {
	_ = templates.ExecuteTemplate(w, "index.html", nil)
}
