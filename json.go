// Steve Phillips / elimisteve
// 2017.01.16

package main

import (
	"fmt"
	"net/http"

	log "github.com/Sirupsen/logrus"
)

const contentTypeJSON = "application/json; charset=utf-8"

func WriteError(w http.ResponseWriter, errStr string, secretErr error) error {
	return WriteErrorStatus(w, errStr, secretErr, http.StatusInternalServerError)
}

func WriteErrorStatus(w http.ResponseWriter, errStr string, secretErr error, status int) error {
	log.Debugf("Real error: %v", secretErr)
	log.Debugf("Returning HTTP %d w/error: %q", status, errStr)

	w.Header().Set("Content-Type", contentTypeJSON)
	w.WriteHeader(status)
	_, err := fmt.Fprintf(w, `{"error":%q}`, errStr)
	return err
}
