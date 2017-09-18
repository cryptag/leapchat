import { combineReducers } from 'redux';
import chatReducer from './chatReducer';
import alertReducer from './alertReducer';

export default combineReducers({
  chat: chatReducer,
  alert: alertReducer
});
