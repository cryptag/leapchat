package taber

import (
	"bytes"
	"encoding/base64"
	"testing"
)

var (
	base_nonce, n1, n2, n3, n4, n5, n6, n12last, large_plaintext, large_testcase []byte
	first_6_nonces                                                               [][]byte
)

func init() {
	base_nonce = []byte("0123456789012345")
	n1, _ = base64.StdEncoding.DecodeString("MDEyMzQ1Njc4OTAxMjM0NQAAAAAAAAAA")
	n2, _ = base64.StdEncoding.DecodeString("MDEyMzQ1Njc4OTAxMjM0NQEAAAAAAAAA")
	n3, _ = base64.StdEncoding.DecodeString("MDEyMzQ1Njc4OTAxMjM0NQIAAAAAAAAA")
	n4, _ = base64.StdEncoding.DecodeString("MDEyMzQ1Njc4OTAxMjM0NQMAAAAAAAAA")
	n5, _ = base64.StdEncoding.DecodeString("MDEyMzQ1Njc4OTAxMjM0NQQAAAAAAAAA")
	n6, _ = base64.StdEncoding.DecodeString("MDEyMzQ1Njc4OTAxMjM0NQUAAAAAAAAA")
	first_6_nonces = [][]byte{n1, n2, n3, n4, n5, n6}
	n12last, _ = base64.StdEncoding.DecodeString("MDEyMzQ1Njc4OTAxMjM0NQsAAAAAAACA")
	large_plaintext = make([]byte, 167+ConstChunkSize*10)
	for _, ch := range chunkify(large_plaintext, 100) {
		copy(ch, []byte(" this is a longer message consisting of 100 characters, repeated ad nauseum to create a test case.. "))
	}
	large_testcase, _ = base64.StdEncoding.DecodeString(box_large_testcase)
}

func Test_NonceGen(t *testing.T) {
	VPrint("Comparing first six nonces in the test progression.")
	for i, nonce := range first_6_nonces {
		n, err := makeChunkNonce(base_nonce, i, false)
		if err != nil {
			t.Error(err.Error())
		}
		if !bytes.Equal(n, nonce) {
			t.Error("Nonces don't match:\n\tExpected: ", nonce, "\n\tCreated: ", n)
		}
	}
	VPrint("Testing last-nonce (chunk 12) test case")
	last_nonce, err := makeChunkNonce(base_nonce, 11, true)
	if err != nil {
		t.Error(err.Error())
	}
	if !bytes.Equal(last_nonce, n12last) {
		t.Error("Nonces don't match:\n\tExpected: ", n12last, "\n\tCreated: ", last_nonce)
	}
}

func Test_BlockRoundTrip(t *testing.T) {
	plaintext := []byte("This is a file and the contents aren't very long, but it'll suffice for testing one-block encryption.")
	key := []byte("12345678901234567890123456789012") // 32 bytes
	base_nonce := []byte("1234567890123456")
	VPrint("Encrypting test block..")
	ciphertext, err := encryptChunk(key, base_nonce, plaintext, 1, false)
	if err != nil {
		t.Error(err.Error())
	}
	VPrint("Decrypting test block..")
	decrypted, err := decryptBlock(key, base_nonce, ciphertext)
	if err != nil {
		t.Error(err.Error())
	}
	VPrint("Comparing pre-crypted to post-crypted plaintext")
	if !bytes.Equal(decrypted, plaintext) {
		t.Error("Decrypted block did not equal original plaintext:",
			"\nOriginal:\t", plaintext,
			"\nDecryptd:\t", decrypted)
	}
	VPrint("Now testing Ciphertext walking of single-block ciphertext")
	blocks, err := walkCiphertext(ciphertext.Block)
	if err != nil {
		t.Error(err.Error())
	}
	if len(blocks) == 0 {
		t.Fatal("Unable to parse any blocks from ciphertext..")
	}
	VPrint("Comparing parsed/walked block to original block for slice inconsistencies..")
	if !bytes.Equal(ciphertext.Block, blocks[0].Block) {
		t.Error("Decrypted block did not equal original plaintext:",
			"\nBlock :\t", ciphertext.Block,
			"\nWalked:\t", blocks[0].Block)
	}
}

func Test_OneBlockEncrypt(t *testing.T) {
	plaintext := []byte("This is a file and the contents aren't very long, but it'll suffice for testing one-block encryption.")
	plaintextfn := "This is a filename.txt"
	key := []byte("12345678901234567890123456789012") // 32 bytes
	basenonce := []byte("1234567890123456")
	expected, err := base64.StdEncoding.DecodeString("AAEAAPdoXdukrJcgTxCpDnZDNdPO74bS/SFfQ5B1Sh44jD7799Hl8qK2UoqUGBdgI1qGuQMKS5JeAczkQPtIRD+bIDflLZOfrhSC1JlkAQv0AuGEpMnGvUVUobWyat6DlutN9EAoqasW5NOgT8Bv1lLWjohs3WOhTv+ZtIu7UpWdeiDV/T/jV5Tl8yAUq5PN00oBnKHttG5akrDsMmwyN14drnZAxblHz5Qq9my9p22D6GY/W7QfBaXiBGXdPQR/vtQuTyMWahPP4PKLLv/FDAiJWJajla6neEkZtpYPTSL0kyzGpHbF009r5siUzTLHuLlmI5bLDIb1OO6rWihygHWHp1z0qXVYgfW5dZFMACk0+w2UZQAAAIvQDRpt3Nr+R/wbSS4giTLIdh8TIowyCUj493Tew5/iOyfi+xdG7vfdFg9qnHbL2kwONFBJbEdbYOgWvErM3cah2jH6+vmXbPCGF7E33m59UlIcYBgPHuH+5Uaoo/1ebK3uytKBCSr214wsUN22gRi0flSGWQ==")
	if err != nil {
		t.Error(err.Error())
	}
	VPrint("Creating demo ciphertext.")
	ciphertext, err := encrypt(plaintextfn, key, basenonce, plaintext)
	if err != nil {
		t.Error(err.Error())
	}
	VPrint("Finished, comparing to known example.")
	if !bytes.Equal(ciphertext, expected) {
		t.Error("Ciphertext did not match expected result: \nCT:\t", ciphertext, "\nExp:\t", expected)
	}
	// Now also test decryption.
}

func Test_ManyBlockEncrypt(t *testing.T) {
	VPrint("Preparing a longer plaintext for encryption..")
	if len(large_plaintext) != (167 + (ConstChunkSize * 10)) {
		t.Error("Failed to create test case of expected length.")
	}
	plaintextfn := "This is another filename.txt"
	key := []byte("01234567890123456789012345678901") // 32 bytes
	basenonce := []byte("0123456789012345")
	// Sample encrypted testcase included in 'testcase_test.go' as var b64_long_testcase (string)
	VPrint("Creating demo ciphertext.")
	ciphertext, err := encrypt(plaintextfn, key, basenonce, large_plaintext)
	if err != nil {
		t.Error(err.Error())
	}
	VPrint("Finished, comparing to known example.")
	if !bytes.Equal(ciphertext, large_testcase) {
		t.Error("Generated ciphertext does not match expected ciphertext, given equal keys and nonces.")
	}
	VPrint("Testing decryption of generated large ciphertext.")
	// Now also test decryption.
	filename, decrypted, err := decrypt(key, basenonce, ciphertext)
	if err != nil {
		t.Fatal(err.Error())
	}
	if filename != plaintextfn {
		t.Error("Filename parsed from ciphertext didn't match input: ", filename, "Should have been:", plaintextfn)
	}
	if !bytes.Equal(large_plaintext, decrypted) {
		t.Error("Decrypted plaintext didn't match original plaintext.")
	}
}

func Test_HighLevelBoxEncryption(t *testing.T) {
	decryptor, ciphertext, err := Encrypt("plain.txt", large_plaintext)
	if err != nil {
		t.Fatal(err.Error())
	}
	filename, plaintext, err := decryptor.Decrypt(ciphertext)
	if err != nil {
		t.Fatal(err.Error())
	}
	if filename != "plain.txt" {
		t.Error("Decrypted filename didn't match input filename.")
	}
	if len(plaintext) != len(large_plaintext) {
		t.Error("Length of decrypted plaintext didn't match length of input plaintext.")
	}
	if !bytes.Equal(plaintext, large_plaintext) {
		t.Error("Decrypted plaintext didn't match input plaintext.")
		VPrint("Expected  begins: ", string(large_plaintext[:200]))
		VPrint("Decrypted begins: ", string(plaintext[:200]))
	}
}
