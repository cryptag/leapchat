import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider, compose } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './reducers';
import App from './components/App';
import ReduxDevTools from './components/_dev/ReduxDevTools';

const enhancer = compose(
    ReduxDevTools.instrument()
);

const store = createStore(rootReducer, enhancer);// Hot reload reducers (requires Webpack or Browserify HMR to be enabled)

if (module.hot) {
    module.hot.accept('./reducers', () =>
        store.replaceReducer(require('./reducers')/*.default if you use Babel 6+ */)
    );
}


ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'));
