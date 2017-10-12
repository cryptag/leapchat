import { combineEpics } from 'redux-observable';
import chatEpics from './chatEpics';

export default combineEpics(
  chatEpics
);
