package hsts

import (
	"fmt"
	"net/http"

	"github.com/cryptag/gosecure/set"
)

const oneYearInSeconds = 31536000 // 365 * 24 * 60 * 60

func Handler(h http.Handler) http.Handler {
	preload := false
	return CustomHandler(h, preload, oneYearInSeconds)
}

func PreloadHandler(h http.Handler) http.Handler {
	preload := true
	return CustomHandler(h, preload, oneYearInSeconds)
}

func CustomHandler(h http.Handler, preload bool, maxAgeInSecs int) http.Handler {
	header := fmt.Sprintf("max-age=%d; includeSubDomains", maxAgeInSecs)
	if preload {
		header += "; preload"
	}
	return set.Header(h, "Strict-Transport-Security", header)
}
