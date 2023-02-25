import { getEmail, getPassphrase } from '../utils/encrypter';
import miniLock from '../utils/miniLock';

// TODO: will be different host from a mobile device, probably if (!window)
const authUrl = `${window.location.origin}/api/login`;


async function connectWithAuthRequest(initiateConnection, mID, secretKey, isNewPassphrase) {
  alert(authUrl);
  const response = await fetch(authUrl, {
    method: "GET",
    headers: {
      'X-Minilock-Id': mID
    }
  });

  const message = await response.blob();
  miniLock.crypto.decryptFile(message, mID, secretKey,
    function (fileBlob, saveName, senderID) {
      const reader = new FileReader();
      reader.addEventListener("loadend", () => {
        const authToken = reader.result;
        initiateConnection({
          authToken,
          secretKey,
          mID,
          isNewRoom: isNewPassphrase,
        });
      });

      reader.readAsText(fileBlob);
    });
}

export const initiateSessionAndConnect = (
  initiateConnection,
  createWebSession,
  urlHash,
) => {
  // 1. Get passphrase
  const {
    passphrase,
    isNewPassphrase
  } = getPassphrase(urlHash);

  // 2. Get email based on passphrase
  let email = getEmail(passphrase);
  // 3. Decrypt to get key pair
  miniLock.crypto.getKeyPair(passphrase, email, async (keyPair) => {
    miniLock.session.keys = keyPair;
    miniLock.session.keyPairReady = true;
    let mID = miniLock.crypto.getMiniLockID(keyPair.publicKey);
    // 4. When we have keypair, create session on device
    if (isNewPassphrase) {
      await createWebSession(passphrase);
    }

    // 5. Initiate connection by doing auth dance
    connectWithAuthRequest(initiateConnection, mID, keyPair.secretKey, isNewPassphrase);
  });
};