import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './index.html';
import './static/lib/fetch/fetch.js';
import './static/js/crypto/blake2s.js';
import './static/js/crypto/nacl.js';
import './static/js/crypto/nacl-stream.js';
import './static/js/crypto/scrypt.js';
import './static/js/base58.js';
import './static/js/miniLock.js';
import './static/js/ui.js';
import './static/sass/main.scss';
import './static/lib/bootstrap/dist/css/bootstrap.css';
import './static/audio/notification_gertz.wav';

ReactDOM.render(<App />, document.getElementById('root'));
