// Steve Phillips / elimisteve
// 2017.03.20

package content

import (
	"net/http"

	"github.com/cryptag/gosecure/set"
)

// GetHandler is middleware that sets the header `X-Content-Type-Options: nosniff`.
func GetHandler(h http.Handler) http.Handler {
	return set.Header(h, "X-Content-Type-Options", "nosniff")
}
