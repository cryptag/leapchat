// Steve Phillips / elimisteve
// 2017.01.16

package main

import (
	"fmt"
	"log"
	"net/http"
)

const contentTypeJSON = "application/json; charset=utf-8"

func WriteError(w http.ResponseWriter, errStr string, secretErr error) error {
	return WriteErrorStatus(w, errStr, secretErr, http.StatusInternalServerError)
}

func WriteErrorStatus(w http.ResponseWriter, errStr string, secretErr error, status int) error {
	if Debug {
		log.Printf("Real error: %v\n", secretErr)
		log.Printf("Returning HTTP %d w/error: %q\n", status, errStr)
	}

	w.Header().Set("Content-Type", contentTypeJSON)
	w.WriteHeader(status)
	_, err := fmt.Fprintf(w, `{"error":%q}`, errStr)
	return err
}
