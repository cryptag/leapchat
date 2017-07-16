import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import 'isomorphic-fetch';
import 'bootstrap/dist/css/bootstrap.css';
import App from './components/App';
import './index.html';
import './static/sass/main.scss';
import './static/fonts/Lato.ttf';
import './static/audio/notification_gertz.wav';

ReactDOM.render(<App />, document.getElementById('root'));
