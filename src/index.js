import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import rootReducer from './reducers';
import ReduxDevTools from './components/_dev/ReduxDevTools';
import 'isomorphic-fetch';
import 'bootstrap/dist/css/bootstrap.css';
import './static/sass/main.scss';
import './static/fonts/Lato.ttf';
import './static/audio/notification_gertz.wav';


// const enhancer = compose(
//   ReduxDevTools.instrument(), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
// );

const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

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
