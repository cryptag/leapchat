package taber

import (
	"testing"
)

var (
	testKey1ID, testKey2ID string
	testKey1, testKey2     *Keys
)

func init() {
	testKey1ID = "2453m8h7r3stzV8NeG4WzrFhsXTTsXTodQA2S6R9J2dfuh"
	testKey1, _ = FromEmailAndPassphrase("cathalgarvey@some.where", "this is a password that totally works for minilock purposes")
	testKey2ID = "xjjCm44Nuj4DyTBuzguJ1d7K6EdP2TWRYzsqiiAbfcGTr"
	testKey2, _ = FromEmailAndPassphrase("joeblocks@else.where", "whatever I write won't be good enough for the NSA")
}

func Test_KeyIdentity(t *testing.T) {
	genID, err := testKey1.EncodeID()
	if err != nil {
		t.Error(err.Error())
	}
	if testKey1ID != genID {
		t.Error("Key IDs don't match:\nShould be:\t" + testKey1ID + "\nBut made:\t" + genID)
	}
}

func Test_CryptoRoundtrip(t *testing.T) {
	pubkey1 := testKey1.PublicOnly()
	pubkey2 := testKey2.PublicOnly()
	if pubkey1.HasPrivate() {
		t.Error("Generated public key should not have private part.")
	}
	if pubkey2.HasPrivate() {
		t.Error("Generated public key should not have private part.")
	}
	nonce1 := []byte("123456789012345678901234")
	msg1 := "Attack at dawn!"
	// Encrypt(plaintext, nonce []byte, to *Keys) (ciphertext []byte)
	// Decrypt(ciphertext, nonce []byte, from *Keys) (plaintext []byte, err error)
	ct1, err := testKey1.Encrypt([]byte(msg1), nonce1, pubkey2)
	if err != nil {
		t.Error(err.Error())
	}
	pt1, err := testKey2.Decrypt(ct1, nonce1, pubkey1)
	if err != nil {
		t.Error(err.Error())
	}
	if string(pt1) != msg1 {
		t.Error("Decrypted message doesn't match original: '" + msg1 + "' vs '" + string(pt1) + "'")
	}
}
