
import {
  CHAT_SET_USERNAME,
  CHAT_INIT_CONNECTION,
  CHAT_INIT_CHAT,
  CHAT_SEND_MESSAGE,
  connectionInitiated,
  disconnected,
  addMessage,
  messageSent,
  setUserStatus,
  userStatusSent,
  usernameSet,
  showSuggestions,
  stopSuggestions
} from '../actions/chatActions';

import {
  alertSuccess,
  alertWarning
} from '../actions/alertActions';

import {
  USER_STATUS_DELAY_MS,
  USERNAME_KEY
} from '../../constants/messaging';

import ChatHandler from './helpers/ChatHandler';
import { combineEpics } from 'redux-observable';
import createDetectVisibilityObservable from './helpers/createDetectPageVisibilityObservable';

const wsUrl = `${window.location.origin.replace('http', 'ws')}/api/ws/messages/all`;
export const chatHandler = new ChatHandler(wsUrl);

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/partition';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/if';
import 'rxjs/add/operator/takeUntil';

const messageEpic = (action$) =>
  action$.ofType('CHAT_START_SUGGESTIONS')
    .mergeMap(({ cursorIndex, filterSuggestions, list }) => {
      return action$.ofType('CHAT_MESSAGE_UPDATE')
        .map((msg) => showSuggestions(cursorIndex, msg.message, filterSuggestions, list))
        .takeUntil(action$.ofType('CHAT_STOP_SUGGESTIONS'))
        .catch((err) => console.error(err));
    });

const suggestionEpic = (action$) =>
  action$.ofType('CHAT_ADD_SUGGESTION')
    .map(() => stopSuggestions())
    .catch((err) => console.error(err));


const initChatHandlerConnection = ({ authToken, secretKey, mID, isNewRoom }) => {
  return chatHandler.initConnection({
    authToken,
    secretKey: secretKey,
    mID,
    isNewRoom,
  });
};

const connectionAlertTtlSeconds = 4;

const initConnectionEpic = (action$) =>
  action$.ofType(CHAT_INIT_CONNECTION)
    .mergeMap(initChatHandlerConnection)
    .mergeMap((isNewRoom) =>
      Observable.merge(
        chatHandler.getMessageSubject()
          .map(addMessage),

        chatHandler.getUserStatusSubject()
          .map(setUserStatus),

        Observable.of(
          connectionInitiated(),
          alertSuccess(`${isNewRoom ? 'New room created.' : ''} Connected to server.`, connectionAlertTtlSeconds)
        )
      )
    ).catch(error => {
      console.error(error);
      return Observable.from([
        alertWarning('Lost connection to chat server. Trying to reconnect...'),
        disconnected()
      ]);
    })
    .catch(error => {
      console.error(error);
      return Observable.from([
        alertWarning('Something went wrong when initiating. Trying again...'),
        disconnected()
      ]);
    });

const setUsernameEpic = (action$, store) =>
  action$.ofType(CHAT_SET_USERNAME)
    .filter(action => action.username && !store.getState().chat.paranoidMode)
    .mergeMap(action =>
      Observable.of(action.username)
        .do(username => {
          const ttl = USER_STATUS_DELAY_MS / 1000;
          chatHandler.sendUserStatus(username, 'viewing', ttl);
        })
        .retryWhen(error => error.delay(500))
        .do(() => localStorage && localStorage.setItem(USERNAME_KEY, action.username))
    )
    .map(username => usernameSet(username));

const ownUserStatusEpic = (action$, store) =>
  action$.ofType(CHAT_INIT_CHAT)
    .mergeMap(() =>
      createDetectVisibilityObservable()
        .throttleTime(USER_STATUS_DELAY_MS)
        .filter(() => store.getState().chat.username)
        .do(status => {
          const ttl = USER_STATUS_DELAY_MS / 1000;
          const { chat: { username } } = store.getState();
          chatHandler.sendUserStatus(username, status, ttl);
        })
        .map(() => userStatusSent())
    )
    .catch(error => {
      console.error(error);
      return Observable.of(alertWarning('Error sending user status.'));
    });

const sendMessageEpic = action$ =>
  action$.ofType(CHAT_SEND_MESSAGE)
    .mergeMap(action =>

      Observable.of(action)
        .do(action => {
          chatHandler.sendMessage(action.message, action.username);
        })
        .retryWhen(error => error.delay(1000))
    )
    .map(() => messageSent())
    .catch(error => {
      console.error(error);
      return Observable.of(alertWarning('Error sending message.'));
    });

export default combineEpics(
  setUsernameEpic,
  ownUserStatusEpic,
  initConnectionEpic,
  sendMessageEpic,
  messageEpic,
  suggestionEpic
);
