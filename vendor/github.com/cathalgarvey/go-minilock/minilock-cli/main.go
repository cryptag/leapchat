package main

/*
* miniLock-cli: A terminal utility to encrypt and decrypt files using the
* miniLock file encryption system
 */

import (
	"fmt"
	"io/ioutil"

	"github.com/alecthomas/kingpin"
	"github.com/cathalgarvey/go-minilock"
	"github.com/cathalgarvey/go-minilock/taber"
	"github.com/howeyc/gopass"
)

var (
	encrypt = kingpin.Command("encrypt", "Encrypt a file.")
	decrypt = kingpin.Command("decrypt", "Decrypt a file.")

	passPhrase = kingpin.Flag("passphrase", "Full passphrase for this miniLock key. If not given through this flag, it will be asked for interactively").
			Short('p').String()
	outputFilename = kingpin.Flag("output", "Name of output file. By default for encryption, this is input filename + '.minilock', and for decryption this is the indicated filename in the ciphertext. Warning: Right now this presents potential security hazards!").
			Short('o').Default("NOTGIVEN").String()

	efile = encrypt.Arg("file", "File to encrypt or decrypt.").Required().String()
	dfile = decrypt.Arg("file", "File to encrypt or decrypt.").Required().String()

	eUserEmail = encrypt.
			Arg("user-email", "Your email address. This need not be secret, but if this isn't *accurate* it must be *globally unique*, it is used for generating security.").
			Required().String()
	dUserEmail = decrypt.
			Arg("user-email", "Your email address. This need not be secret, but if this isn't *accurate* it must be *globally unique*, it is used for generating security.").
			Required().String()

	recipients      = encrypt.Arg("recipients", "One or more miniLock IDs to add to encrypted file.").Strings()
	noEncryptToSelf = encrypt.Flag("dont-encrypt-to-self", "Normal behaviour is to add sender's key to recipients list; this disables that action.").Bool()

	mlfilecontents []byte
	userKey        *taber.Keys
	err            error
)

func main() {
	kingpin.UsageTemplate(kingpin.DefaultUsageTemplate).Author("Cathal Garvey")
	//kingpin.CommandLine.Help = "miniLock-cli: The miniLock encryption system for terminal/scripted use."
	switch kingpin.Parse() {
	case "encrypt":
		fmt.Println("Encrypting to self: ", !*noEncryptToSelf)
		kingpin.FatalIfError(encryptFile(), "Failed to encrypt..")
	case "decrypt":
		{
			kingpin.FatalIfError(decryptFile(), "Failed to decrypt..")
		}
	default:
		{
			fmt.Println("No subcommand provided..")
		}
	}
	if userKey != nil {
		userKey.Wipe()
	}
}

func encryptFile() error {
	f, err := ioutil.ReadFile(*efile)
	if err != nil {
		return err
	}
	pp := getPass()
	mlfilecontents, err = minilock.EncryptFileContentsWithStrings(*efile, f, *eUserEmail, pp, !*noEncryptToSelf, *recipients...)
	if err != nil {
		return err
	}
	if *outputFilename == "NOTGIVEN" {
		*outputFilename = *efile + ".minilock"
	}
	userKey, err = minilock.GenerateKey(*eUserEmail, pp)
	if err != nil {
		return err
	}
	userID, err := userKey.EncodeID()
	if err != nil {
		return err
	}
	fmt.Println("File encrypted using ID: '" + userID + "'")
	return ioutil.WriteFile(*outputFilename, mlfilecontents, 33204)
}

func decryptFile() error {
	pp := getPass()
	userKey, err = minilock.GenerateKey(*dUserEmail, pp)
	if err != nil {
		return err
	}
	mlfilecontents, err = ioutil.ReadFile(*dfile)
	if err != nil {
		return err
	}
	sender, filename, filecontents, err := minilock.DecryptFileContents(mlfilecontents, userKey)
	if err != nil {
		return err
	}
	if *outputFilename != "NOTGIVEN" {
		filename = *outputFilename
	}
	fmt.Println("File received from id '"+sender+"', saving to", filename)
	return ioutil.WriteFile(filename, filecontents, 33204)
}

func getPass() string {
	if *passPhrase != "" {
		return *passPhrase
	}
	fmt.Print("Enter passphrase: ")
	p, err := gopass.GetPasswd()
	if err != nil {
		panic(err)
	}
	return string(p)
}
