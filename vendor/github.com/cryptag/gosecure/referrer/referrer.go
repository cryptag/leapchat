// Steve Phillips / elimisteve
// 2017.03.20

package referrer

import (
	"net/http"

	"github.com/cryptag/gosecure/set"
)

// NoHandler is middleware that sets the header `Referrer-Policy: no-referrer`.
func NoHandler(h http.Handler) http.Handler {
	return set.Header(h, "Referrer-Policy", "no-referrer")
}

// SameOriginHandler is middleware that sets the header `Referrer-Policy: same-origin`.
func SameOriginHandler(h http.Handler) http.Handler {
	return set.Header(h, "Referrer-Policy", "same-origin")
}
