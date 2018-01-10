package taber

import (
	"bytes"
	"encoding/base64"
	"testing"
)

var (
	testKeyGenPriv, testKeyGenPub []byte
	testKeyGenID                  = "2453m8h7r3stzV8NeG4WzrFhsXTTsXTodQA2S6R9J2dfuh"
)

func init() {
	testKeyGenPriv, _ = base64.StdEncoding.DecodeString("R92JSkvKPQzkRbcxpqQ4wNjc3uepTUlScG9n5cyGl6s=")
	testKeyGenPub, _ = base64.StdEncoding.DecodeString("zZRIJ9myJk2fncUGmb1wr9zHC94K5kzSAXSkrT7GEiI=")
}

func Test_Keygen(t *testing.T) {
	gen_key, err := FromEmailAndPassphrase("cathalgarvey@some.where", "this is a password that totally works for minilock purposes")
	if err != nil {
		t.Fatal(err.Error())
	}
	if !bytes.Equal(testKeyGenPriv, gen_key.Private) {
		t.Fatal("Generated private key does not match test key:\n ", testKeyGenPriv, "\n ", gen_key.Private)
	}
	if !bytes.Equal(testKeyGenPub, gen_key.Public) {
		t.Fatal("Generated public key does not match test key:\n ", testKeyGenPub, "\n ", gen_key.Public)
	}
	gen_id, err := gen_key.EncodeID()
	if err != nil {
		t.Fatal(err.Error())
	}
	if gen_id != testKeyGenID {
		t.Fatal("IDs do not match:\n Test ID:", testKeyGenID, "\n Gener'd:", gen_id)
	}
	pub_from_id, err := FromID(testKeyGenID)
	if err != nil {
		t.Fatal(err.Error())
	}
	if !bytes.Equal(pub_from_id.Public, gen_key.Public) {
		t.Fatal("ID-imported public key does not match test key:\n ", testKeyGenPub, "\n ", gen_key.Public)
	}
}
