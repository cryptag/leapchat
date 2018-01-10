package minilock

import (
	"bytes"
	"testing"
)

func Test_RoundTripMinilock(t *testing.T) {
	// EncryptFile(filename string, fileContents []byte, sender *taber.Keys, recipients... *taber.Keys) (miniLockContents []byte, err error)
	// DecryptFileContents(file_contents []byte, recipientKey *taber.Keys) (senderID, filename string, contents []byte, err error)
	// Set Up
	testcase, err := Asset("binary_samples/mye.go")
	if err != nil {
		t.Fatal("Couldn't load test binary asset.")
	}
	sender := testKey1
	recipient := testKey2
	// Encryption
	genCrypted, err := EncryptFileContents("mye.go", testcase, sender, recipient.PublicOnly(), sender.PublicOnly())
	if err != nil {
		t.Fatal("Couldn't create encrypted test case: ", err.Error())
	}
	// Decryption
	senderID, filename, contents, err := DecryptFileContents(genCrypted, recipient)
	if err != nil {
		t.Fatal("Failed to decrypt with recipient key: " + err.Error())
	}
	realSenderID, err := sender.EncodeID()
	if err != nil {
		t.Error(err.Error())
	}
	if senderID != realSenderID {
		t.Error("Received SenderID [1] did not match sending key's ID [2]: ", senderID, realSenderID)
	}
	if filename != "mye.go" {
		t.Error("Received filename [1] didn't match encrypted filename [2]: ", filename, "mye.go")
	}
	if !bytes.Equal(testcase, contents) {
		t.Error("Received plaintext [1] didn't match encrypted plaintext [2]: \n", string(contents), "\n", string(testcase))
	}
}

func Test_EncryptEmptyFile(t *testing.T) {
	// With thanks to github.com/sahib for discovering and reporting this bug!
	keys, err := GenerateKey("alice@jabber.wonderland.lit", "drugs")
	if err != nil {
		t.Error(err.Error())
	}

	_, err = EncryptFileContents("/tmp/dummy", []byte{}, keys, keys)
	if err != ErrNilPlaintext {
		t.Error("Got wrong error for empty plaintext:", err.Error())
	}
}

// func (self *miniLockv1Header) ExtractDecryptInfo(recipientKey *taber.Keys) (nonce []byte, DI *DecryptInfoEntry, err error) {
// func (self *miniLockv1Header) ExtractFileInfo(recipientKey *taber.Keys) (*FileInfo, error) {
// func (self *miniLockv1Header) DecryptContents(ciphertext []byte, recipientKey *taber.Keys) (senderID, filename string, contents []byte, err error) {
