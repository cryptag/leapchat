import { getEmail, getPassphrase } from '../utils/encrypter';
import miniLock from '../utils/miniLock';
import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

// TODO: will be different host from a mobile device, probably if (!window)
let authUrl = `${window.location.origin}/api/login`;

if (Capacitor.isNativePlatform()) {
  authUrl = "http://10.0.2.2:8080/api/login";
}

// Helper for parsing response from Go API
//
// From https://stackoverflow.com/a/36183085
const b64toBlob = (base64, type = 'application/octet-stream') =>
      fetch(`data:${type};base64,${base64}`).then(res => res.blob());

async function connectWithAuthRequest(initiateConnection, mID, secretKey, isNewPassphrase) {
  let response, message;
  if (Capacitor.isNativePlatform()) {
    response = await CapacitorHttp.request({
      url: authUrl,
      headers: {
        'X-Minilock-Id': mID
      },
      method: 'GET',
      responseType: 'blob'  // Makes `response.data` base64-encoded binary data
    });

    message = await b64toBlob(response.data);
  } else {
    response = await fetch(authUrl, {
      method: "GET",
      headers: {
        'X-Minilock-Id': mID
      }
    });

    message = await response.blob();
  }

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