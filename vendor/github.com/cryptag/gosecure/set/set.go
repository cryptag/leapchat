// Steve Phillips / elimisteve
// 2017.03.20

package set

import "net/http"

func Header(h http.Handler, header, value string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		w.Header().Add(header, value)
		h.ServeHTTP(w, req)
	})
}
