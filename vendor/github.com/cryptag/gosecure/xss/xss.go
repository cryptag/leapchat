// Steve Phillips / elimisteve
// 2017.03.20

package xss

import (
	"net/http"

	"github.com/cryptag/gosecure/set"
)

// GetHandler is middleware that sets the header `X-Xss-Protection: 1; mode=block`.
func GetHandler(h http.Handler) http.Handler {
	return set.Header(h, "X-Xss-Protection", "1; mode=block")
}
