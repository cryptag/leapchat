package main

import (
	"crypto/tls"
	"flag"
	"log"
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
	"github.com/gorilla/mux"
	"github.com/justinas/alice"
	"golang.org/x/crypto/acme/autocert"
)

func main() {
	httpAddr := flag.String("http", "127.0.0.1:8080",
		"Address to listen on HTTP (redirects to HTTPS address)")
	httpsAddr := flag.String("https", "127.0.0.1:8443",
		"Address to listen on HTTPS")
	domain := flag.String("domain", "", "Domain of this service")
	flag.Parse()

	// http://... -> https://...
	httpsPort := strings.SplitN(*httpsAddr, ":", 2)[1]
	go redirectToHTTPS(*httpAddr, httpsPort)

	r := mux.NewRouter()

	r.HandleFunc("/", GetIndex).Methods("GET")

	http.Handle("/", r)

	// TODO: Add logging that logs when *Debug. This should trigger
	// canary.Handler, too.
	gotWarrant := false
	middleware := alice.New(canary.GetHandler(&gotWarrant),
		csp.GetHandler(*domain), hsts.PreloadHandler, frame.DenyHandler,
		content.GetHandler, xss.GetHandler, referrer.NoHandler)

	srv := &http.Server{
		Addr:         *httpsAddr,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
		TLSConfig:    getTLSConfig(*domain),
		Handler:      middleware.Then(r),
	}
	log.Printf("Listening on %v\n", *httpsAddr)
	log.Fatal(srv.ListenAndServeTLS("", ""))
}

func redirectToHTTPS(httpAddr, httpsPort string) {
	srv := &http.Server{
		Addr:         httpAddr,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
		Handler: http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			w.Header().Set("Connection", "close")
			domain := strings.SplitN(req.Host, ":", 2)[0]
			url := "https://" + domain + ":" + httpsPort + req.URL.String()
			http.Redirect(w, req, url, http.StatusFound)
		}),
	}
	log.Printf("Listening on %v\n", httpAddr)
	log.Fatal(srv.ListenAndServe())
}

func getTLSConfig(domain string) *tls.Config {
	// From https://blog.gopheracademy.com/advent-2016/exposing-go-on-the-internet/

	m := autocert.Manager{
		Prompt:     autocert.AcceptTOS,
		HostPolicy: autocert.HostWhitelist(domain),
		Cache:      autocert.DirCache("./" + domain),
	}

	return &tls.Config{
		// Causes servers to use Go's default ciphersuite preferences,
		// which are tuned to avoid attacks. Does nothing on clients.
		PreferServerCipherSuites: true,
		// Only use curves which have assembly implementations
		CurvePreferences: []tls.CurveID{
			// tls.CurveP521, tls.CurveP384,
			tls.CurveP256,
			tls.X25519, // Go 1.8 only
		},
		MinVersion: tls.VersionTLS12,
		CipherSuites: []uint16{
			tls.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305, // Go 1.8 only
			tls.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,   // Go 1.8 only
			tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
			tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,

			// Best disabled, as they don't provide Forward Secrecy,
			// but might be necessary for some clients
			// tls.TLS_RSA_WITH_AES_256_GCM_SHA384,
			// tls.TLS_RSA_WITH_AES_128_GCM_SHA256,
		},
		GetCertificate: m.GetCertificate,
	}
}

func GetIndex(w http.ResponseWriter, req *http.Request) {
	w.Write([]byte("Hello, security!\n"))
}
