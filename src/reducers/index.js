import { combineReducers } from 'redux';
import chatReducer from './chatReducer';
import taskReducer from './taskReducer';
import alertReducer from './alertReducer';

export default combineReducers({
  chat: chatReducer,
  task: taskReducer,
  alert: alertReducer
});
