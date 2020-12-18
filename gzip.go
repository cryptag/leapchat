package main

import (
	"compress/gzip"
	"io"
	"net/http"
	"strings"
)

// GZip solution derived from
// https://www.lemoda.net/go/gzip-handler/index.html and
// https://stackoverflow.com/a/50898293/197160

type gzipResponseWriter struct {
	io.Writer
	http.ResponseWriter
}

// Use the Writer part of gzipResponseWriter to write the output.

func (w gzipResponseWriter) Write(b []byte) (int, error) {
	return w.Writer.Write(b)
}

func inAnyStr(s string, container []string) bool {
	for i := 0; i < len(container); i++ {
		if strings.Contains(container[i], s) {
			return true
		}
	}
	return false
}

func gzipHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if inAnyStr("gzip", r.Header["Accept-Encoding"]) {
			w.Header().Set("Content-Encoding", "gzip")
			gz := gzip.NewWriter(w)
			defer gz.Close()
			h.ServeHTTP(gzipResponseWriter{Writer: gz, ResponseWriter: w}, r)
			return
		}
		h.ServeHTTP(w, r)
	})
}
