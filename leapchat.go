package main

import (
	"flag"

	log "github.com/Sirupsen/logrus"
	"github.com/cathalgarvey/go-minilock/taber"
	"github.com/cryptag/minishare/miniware"
)

var (
	randomServerKey *taber.Keys
)

func init() {
	k, err := taber.RandomKey()
	if err != nil {
		log.Fatalf("Error generating random server key: %v\n", err)
	}

	// Setting globlar var
	randomServerKey = k
}

func main() {
	httpAddr := flag.String("http", "127.0.0.1:8000",
		"Address to listen on HTTP")
	prod := flag.Bool("prod", false, "Run in Production mode.")
	flag.Parse()

	if *prod {
		log.SetLevel(log.FatalLevel)
	} else {
		log.SetLevel(log.DebugLevel)
	}

	m := miniware.NewMapper()

	srv := NewServer(m, *httpAddr)

	log.Infof("Listening on %v", *httpAddr)
	log.Fatal(srv.ListenAndServe())
}
