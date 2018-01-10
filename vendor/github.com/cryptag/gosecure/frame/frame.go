// Steve Phillips / elimisteve
// 2017.03.20

package frame

import (
	"net/http"

	"github.com/cryptag/gosecure/set"
)

// SameOriginHandler is middleware that sets the header `X-Frame-Options: SAMEORIGIN`.
func SameOriginHandler(h http.Handler) http.Handler {
	return set.Header(h, "X-Frame-Options", "SAMEORIGIN")
}

// DenyHandler is middleware that sets the header `X-Frame-Options: DENY`.
func DenyHandler(h http.Handler) http.Handler {
	return set.Header(h, "X-Frame-Options", "DENY")
}
