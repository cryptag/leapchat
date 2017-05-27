package main

import (
	"flag"
	"strings"

	"github.com/cryptag/minishare/miniware"

	log "github.com/Sirupsen/logrus"
	"github.com/cathalgarvey/go-minilock/taber"
)

var (
	randomServerKey *taber.Keys
)

func init() {
	k, err := taber.RandomKey()
	if err != nil {
		log.Fatalf("Error generating random server key: %v\n", err)
	}

	// Setting global var
	randomServerKey = k
}

func main() {
	httpAddr := flag.String("http", "127.0.0.1:8080",
		"Address to listen on HTTP")
	httpsAddr := flag.String("https", "127.0.0.1:8443",
		"Address to listen on HTTPS")
	domain := flag.String("domain", "", "Domain of this service")
	prod := flag.Bool("prod", false, "Run in Production mode.")
	flag.Parse()

	if *prod {
		log.SetLevel(log.FatalLevel)
	} else {
		log.SetLevel(log.DebugLevel)
	}

	m := miniware.NewMapper()

	srv := NewServer(m, *httpAddr)

	if *prod {
		if *domain == "" {
			log.Fatal("You must specify a -domain when using the -prod flag.")
		}
		// Setup http->https redirection
		httpsPort := strings.SplitN(*httpsAddr, ":", 2)[1]
		go redirectToHTTPS(*httpAddr, httpsPort)
		// Production modifications to server
		ProductionServer(srv, *httpsAddr, *domain)
		log.Infof("Listening on %v", *httpsAddr)
		log.Fatal(srv.ListenAndServeTLS("", ""))
	} else {
		log.Infof("Listening on %v", *httpAddr)
		log.Fatal(srv.ListenAndServe())
	}
}
