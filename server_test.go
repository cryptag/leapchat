package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParseMinilockID(t *testing.T) {
	// request without header returns Error
	req := httptest.NewRequest(http.MethodGet, "/", nil)

	mID, keypair, err := parseMinilockID(req)

	assert.Equal(t, "", mID, fmt.Sprintf("mID was not an empty string: %v\n", mID))
	assert.Nil(t, keypair, fmt.Sprintf("keypair was unexpectedly not nil: %v\n", keypair))
	assert.NotNil(t, err, fmt.Sprintf("err was unexpectedly nil: %v\n", err))

	// request with invalid header value returns Error
	invalidMiniLockId := "2aSQkrU5hp"
	req.Header.Set("X-Minilock-Id", invalidMiniLockId)

	mID, keypair, err = parseMinilockID(req)

	assert.Equal(t, "", mID, fmt.Sprintf("mID was not an empty string: %v\n", mID))
	assert.Nil(t, keypair, fmt.Sprintf("keypair was unexpectedly not nil: %v\n", keypair))
	assert.NotNil(t, err, fmt.Sprintf("err was unexpectedly nil: %v\n", err))

	// request with valid header value returns value, nil Error
	validMiniLockId := "s9dDgRKVWvnkpifRXiSgFGj9QLgq1BZ3qvzCsnxPFDrQG"
	req.Header.Set("X-Minilock-Id", validMiniLockId)

	mID, keypair, err = parseMinilockID(req)

	assert.Equal(t, validMiniLockId, mID, fmt.Sprintf("mID was unexpected an empty string: %v\n", mID))
	assert.NotNil(t, keypair, fmt.Sprintf("keypair was unexpectedly nil: %v\n", keypair))
	assert.Nil(t, err, fmt.Sprintf("err was unexpectedly not nil: %v\n", err))

}
