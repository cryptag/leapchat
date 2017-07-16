/*
 * nacl-stream: streaming encryption based on TweetNaCl.js
 * Written by Dmitry Chestnykh in 2014. Public domain.
 * <https://github.com/dchest/nacl-stream-js>
 */
(function(root, f) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) module.exports.stream = f(require('tweetnacl/nacl-fast'));
  else root.nacl.stream = f(root.nacl);

}(this, function(nacl) {
  'use strict';

  if (!nacl) throw new Error('tweetnacl not loaded');

  var DEFAULT_MAX_CHUNK = 65535;

  var ZEROBYTES = nacl.lowlevel.crypto_secretbox_ZEROBYTES;
  var BOXZEROBYTES = nacl.lowlevel.crypto_secretbox_BOXZEROBYTES;
  var crypto_secretbox = nacl.lowlevel.crypto_secretbox;
  var crypto_secretbox_open = nacl.lowlevel.crypto_secretbox_open;

  function incrementChunkCounter(fullNonce) {
    for (var i = 16; i < 24; i++) {
      fullNonce[i]++;
      if (fullNonce[i]) break;
    }
  }

  function setLastChunkFlag(fullNonce) {
    fullNonce[23] |= 0x80;
  }

  function clean() {
    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];
      for (var j = 0; j < arg.length; j++) arg[j] = 0;
    }
  }

  function readChunkLength(data, offset) {
    offset |= 0;
    if (data.length < offset + 4) return -1;
    return data[offset] | data[offset+1] << 8 |
           data[offset+2] << 16 | data[offset+3] << 24;
  };


  function checkArgs(key, nonce, maxChunkLength) {
    if (key.length !== 32) throw new Error('bad key length, must be 32 bytes');
    if (nonce.length !== 16) throw new Error('bad nonce length, must be 16 bytes');
    if (maxChunkLength >= 0xffffffff) throw new Error('max chunk length is too large');
    if (maxChunkLength < 16) throw new Error('max chunk length is too small');
  }

  function StreamEncryptor(key, nonce, maxChunkLength) {
    checkArgs(key, nonce, maxChunkLength);
    this._key = key;
    this._fullNonce = new Uint8Array(24);
    this._fullNonce.set(nonce);
    this._maxChunkLength = maxChunkLength || DEFAULT_MAX_CHUNK;
    this._in = new Uint8Array(ZEROBYTES + this._maxChunkLength);
    this._out = new Uint8Array(ZEROBYTES + this._maxChunkLength);
    this._done = false;
  }

  StreamEncryptor.prototype.encryptChunk = function(chunk, isLast) {
    if (this._done) throw new Error('called encryptChunk after last chunk');
    var chunkLen = chunk.length;
    if (chunkLen > this._maxChunkLength)
      throw new Error('chunk is too large: ' + chunkLen + ' / ' + this._maxChunkLength);
    for (var i = 0; i < ZEROBYTES; i++) this._in[i] = 0;
    this._in.set(chunk, ZEROBYTES);
    if (isLast) {
      setLastChunkFlag(this._fullNonce);
      this._done = true;
    }
    crypto_secretbox(this._out, this._in, chunkLen + ZEROBYTES, this._fullNonce, this._key);
    incrementChunkCounter(this._fullNonce);
    var encryptedChunk = this._out.subarray(BOXZEROBYTES-4, BOXZEROBYTES-4 + chunkLen+16+4);
    encryptedChunk[0] = (chunkLen >>>  0) & 0xff;
    encryptedChunk[1] = (chunkLen >>>  8) & 0xff;
    encryptedChunk[2] = (chunkLen >>> 16) & 0xff;
    encryptedChunk[3] = (chunkLen >>> 24) & 0xff;
    return new Uint8Array(encryptedChunk);
  };

  StreamEncryptor.prototype.clean = function() {
    clean(this._fullNonce, this._in, this._out);
  };

  function StreamDecryptor(key, nonce, maxChunkLength) {
    checkArgs(key, nonce, maxChunkLength);
    this._key = key;
    this._fullNonce = new Uint8Array(24);
    this._fullNonce.set(nonce);
    this._maxChunkLength = maxChunkLength || DEFAULT_MAX_CHUNK;
    this._in = new Uint8Array(ZEROBYTES + this._maxChunkLength);
    this._out = new Uint8Array(ZEROBYTES + this._maxChunkLength);
    this._failed = false;
    this._done = false;
  }

  StreamDecryptor.prototype._fail = function() {
    this._failed = true;
    this.clean();
    return null;
  };

  StreamDecryptor.prototype.decryptChunk = function(encryptedChunk, isLast) {
    if (this._failed) return null;
    if (this._done) throw new Error('called decryptChunk after last chunk');
    var encryptedChunkLen = encryptedChunk.length;
    if (encryptedChunkLen < 4 + BOXZEROBYTES) return this._fail();
    var chunkLen = readChunkLength(encryptedChunk);
    if (chunkLen < 0 || chunkLen > this._maxChunkLength) return this._fail();
    if (chunkLen + 4 + BOXZEROBYTES !== encryptedChunkLen) return this._fail();
    for (var i = 0; i < BOXZEROBYTES; i++) this._in[i] = 0;
    for (i = 0; i < encryptedChunkLen-4; i++) this._in[BOXZEROBYTES+i] = encryptedChunk[i+4];
    if (isLast) {
      setLastChunkFlag(this._fullNonce);
      this._done = true;
    }
    if (crypto_secretbox_open(this._out, this._in, encryptedChunkLen+BOXZEROBYTES-4,
                this._fullNonce, this._key) !== 0) return this._fail();
    incrementChunkCounter(this._fullNonce);
    return new Uint8Array(this._out.subarray(ZEROBYTES, ZEROBYTES + chunkLen));
  };

  StreamDecryptor.prototype.clean = function() {
    clean(this._fullNonce, this._in, this._out);
  };

  return {
    createEncryptor: function(k, n, c) { return new StreamEncryptor(k, n, c); },
    createDecryptor: function(k, n, c) { return new StreamDecryptor(k, n, c); },
    readChunkLength: readChunkLength
  };

}));
