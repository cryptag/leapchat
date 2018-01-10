package minilock

import (
	"bytes"
	"testing"
)

// Go-Bindata likes to know where to base paths when loading
// unit tests?
var rootDir = "."

func Test_ParseMinilockFile(t *testing.T) {
	testcase, err := Asset("binary_samples/mye.go.minilock")
	if err != nil {
		t.Fatal("Couldn't load test binary asset.")
	}
	expectedPlaintext, err := Asset("binary_samples/mye.go")
	if err != nil {
		t.Fatal("Couldn't load test binary asset.")
	}
	header, ciphertext, err := ParseFileContents(testcase)
	if err != nil {
		t.Fatal("Failed to parse testcase.")
	}
	//fmt.Println(header)
	// Either test1 or test2 should be able to decrypt but only one is the sender..
	test1 := testKey1
	senderID, filename, contents, err := header.DecryptContents(ciphertext, test1)
	if err != nil {
		t.Fatal("Failed to decrypt with testKey1: " + err.Error())
	}
	if senderID != "xjjCm44Nuj4DyTBuzguJ1d7K6EdP2TWRYzsqiiAbfcGTr" {
		t.Error("SenderID was expected to be 'xjjCm44Nuj4DyTBuzguJ1d7K6EdP2TWRYzsqiiAbfcGTr' but was: " + senderID)
	}
	if filename != "mye.go" {
		t.Error("Filename returned should have been 'mye.go', was: " + filename)
	}
	if !bytes.Equal(contents, expectedPlaintext) {
		t.Error("Plaintext did not match expected plaintext.")
	}
	senderID2, filename2, contents2, err := DecryptFileContents(testcase, test1)
	if err != nil {
		t.Fatal("Failed to decrypt on second try with testKey1: " + err.Error())
	}
	if senderID != senderID2 {
		t.Error("Inconsistency between senderID returned by DecryptFileContents and manual parsing/header decryption.")
	}
	if filename != filename2 {
		t.Error("Inconsistency between filename returned by DecryptFileContents and manual parsing/header decryption.")
	}
	if !bytes.Equal(contents2, expectedPlaintext) {
		t.Error("Plaintext did not match expected plaintext.")
	}
}
