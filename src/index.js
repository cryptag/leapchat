import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, compose, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import rootReducer from './reducers';
import rootEpic from './epics';
import 'bootstrap/dist/css/bootstrap.css';
import './static/sass/main.scss';
import './static/fonts/Lato.ttf';
import './static/audio/notification_gertz.wav';
import './utils/detect_browser';
import './utils/origin_polyfill';
import App from './components/App';

const composeEnhancers =
  typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      }) : compose;

const epicMiddleware = createEpicMiddleware(rootEpic)
const enhancer = composeEnhancers(
  applyMiddleware(epicMiddleware)
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
