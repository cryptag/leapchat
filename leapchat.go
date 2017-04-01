package main

import (
	"flag"
	"html/template"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

func main() {
	httpAddr := flag.String("http", "127.0.0.1:8000",
		"Address to listen on HTTP")
	flag.Parse()

	r := mux.NewRouter()

	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/",
		http.FileServer(http.Dir("./static")))).Methods("GET")
	r.PathPrefix("/build/").Handler(http.StripPrefix("/build/",
		http.FileServer(http.Dir("./build")))).Methods("GET")

	r.HandleFunc("/", GetIndex).Methods("GET")
	// r.HandleFunc("/v1/api/login", Login).Methods("GET")
	// r.HandleFunc("/v1/api/messages", miniware.Auth(Login)).Methods("GET")

	http.Handle("/", r)

	srv := &http.Server{
		Addr:         *httpAddr,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
		Handler:      r,
	}
	log.Printf("Listening on %v\n", *httpAddr)
	log.Fatal(srv.ListenAndServe())
}

var templates = template.Must(template.ParseFiles("index.html"))

func GetIndex(w http.ResponseWriter, req *http.Request) {
	_ = templates.ExecuteTemplate(w, "index.html", nil)
}
