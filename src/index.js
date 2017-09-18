import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { Provider } from 'react-redux';
import { createStore, compose, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable'
import rootReducer from './reducers';
import rootEpic from './epics';
import ReduxDevTools from './components/_dev/ReduxDevTools';
import 'isomorphic-fetch';
import 'bootstrap/dist/css/bootstrap.css';
import './static/sass/main.scss';
import './static/fonts/Lato.ttf';
import './static/audio/notification_gertz.wav';


const epicMiddleware = createEpicMiddleware(rootEpic)
const enhancer = compose(
  applyMiddleware(epicMiddleware),
  ReduxDevTools.instrument()
);

const store = createStore(rootReducer, enhancer);

if (module.hot) {
  module.hot.accept('./reducers', () =>
    store.replaceReducer(require('./reducers'))
  );
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'));
