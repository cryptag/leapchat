// Steve Phillips / elimisteve
// 2017.03.20

package frame

import (
	"net/http"

	"github.com/cryptag/gosecure/set"
)

func GetHandler(origin string) func(h http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			w.Header().Set("X-Frame-Options", "ALLOW-FROM https://"+origin)
			w.Header().Set("Content-Security-Policy", "frame-ancestors 'self' https://"+origin)
			h.ServeHTTP(w, req)
		})
	}
}

// SameOriginHandler is middleware that sets the header `X-Frame-Options: SAMEORIGIN`.
func SameOriginHandler(h http.Handler) http.Handler {
	return set.Header(h, "X-Frame-Options", "SAMEORIGIN")
}

// DenyHandler is middleware that sets the header `X-Frame-Options: DENY`.
func DenyHandler(h http.Handler) http.Handler {
	return set.Header(h, "X-Frame-Options", "DENY")
}
