import { combineReducers } from 'redux';
import chatReducer from './chatReducer';
import alertReducer from './alertReducer';
import settingsReducer from './settingsReducer';

export default combineReducers({
  chat: chatReducer,
  alert: alertReducer,
  settings: settingsReducer,
});
