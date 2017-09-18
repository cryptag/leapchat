import {
  CHAT_INIT_CONNECTION,
  CHAT_CONNECTION_INITIATED,
  CHAT_DISCONNECTED,
  CHAT_ADD_MESSAGE,
  CHAT_SET_USER_STATUS,
  CHAT_USERNAME_SET
} from '../actions/chatActions';

import {
  PARANOID_USERNAME,
  USERNAME_KEY
} from '../constants/messaging';

const paranoidMode = document && document.location.hash.endsWith('----') || false;
const pincodeRequired = document && document.location.hash.endsWith('--') || false;

const initialState = {
  connecting: false,
  connected: false,
  shouldConnect: true,
  pincodeRequired,
  paranoidMode,
  username: paranoidMode ? PARANOID_USERNAME : '',
  previousUsername: localStorage && localStorage.getItem(USERNAME_KEY) || '',
  status: '',
  messages: [],
  statuses: []
};

function chatReducer(state = initialState, action) {


  switch (action.type) {

    case CHAT_INIT_CONNECTION:
      return Object.assign({}, state, {
        messages: [],
        connecting: true,
        connected: false,
        shouldConnect: false,
        pincodeRequired: false,
        ready: false
      })

    case CHAT_CONNECTION_INITIATED:
      return Object.assign({}, state, {
        connecting: false,
        connected: true,
        shouldConnect: false,
      })

    case CHAT_DISCONNECTED:
      return Object.assign({}, state, {
        connecting: false,
        connected: false,
        shouldConnect: true,
        ready: false
      })

    case CHAT_ADD_MESSAGE:
      return Object.assign({}, state, {
        messages: [...state.messages, {
          key: action.key,
          from: action.fromUsername,
          msg: action.message
        }]
      });

    case CHAT_SET_USER_STATUS:
      return Object.assign({}, state, {
        statuses: Object.assign({}, state.statuses, { [action.username]: action.status })
      });

    case CHAT_USERNAME_SET:
      return Object.assign({}, state, {
        username: state.paranoidMode ? PARANOID_USERNAME : action.username,
        status: 'viewing',
        previousUsername: ''
      });

    default:
      return state;
  }
}

export default chatReducer;
