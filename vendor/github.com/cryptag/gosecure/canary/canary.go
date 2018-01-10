// Steve Phillips / elimisteve
// 2017.03.16

package canary

import "net/http"

func GetHandler(gotWarrant *bool) func(h http.Handler) http.Handler {
	denyMsg := "We have not received a warrant from the US government."
	return GetCustomHandler(gotWarrant, denyMsg)
}

func GetCustomHandler(gotWarrant *bool, denyMsg string) func(h http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			if *gotWarrant {
				denyMsg = ""
			}
			w.Header().Set("X-Warrant-Canary", denyMsg)
			h.ServeHTTP(w, req)
		})
	}
}
