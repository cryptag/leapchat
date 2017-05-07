import { genPassphrase } from '../data/minishare';

const sha384 = require('js-sha512').sha384;

const emailDomain = '@cryptag.org';

export function getEmail(passphrase){
  return sha384(passphrase) + emailDomain;
}

export function getPassphrase(documentHash){
  let isNewRoom = false;

  let passphrase = documentHash || '#';
  passphrase = passphrase.slice(1);

  // Generate new room for user if none specified (that is, if the
  // URL hash is blank)
  if (!passphrase){
    passphrase = genPassphrase();
    isNewRoom = true;
  }

  return {
    passphrase,
    isNewRoom
  };
}

// TODO: Do smarter msgKey creation
export function generateMessageKey(i){
  let date = new Date();
  return date.toGMTString() + ' - ' + date.getSeconds() + '.' + date.getMilliseconds() + '.' + i;
}
