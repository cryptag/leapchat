import {
  CHAT_PINCODE_REQUIRED,
  CHAT_USE_PARANOID_MODE,
  CHAT_READY_TO_CONNECT,
  CHAT_INIT_CONNECTION,
  CHAT_CONNECTION_INITIATED,
  CHAT_DISCONNECTED,
  CHAT_ADD_MESSAGE,
  CHAT_SET_USER_STATUS,
  CHAT_USERNAME_SET
} from '../actions/chatActions';

const PARANOID_USERNAME = ' ';

const initialState = {
  connecting: false,
  connected: false,
  shouldConnect: false,
  pincodeRequired: document && document.location.hash.endsWith('--'),
  paranoidMode: document && document.location.hash.endsWith('---'),
  usernameRequired: false,
  username: '',
  status: '',
  messages: [],
  statuses: []
};

function chatReducer(state = initialState, action) {


  switch (action.type) {

    case CHAT_READY_TO_CONNECT: 
      return Object.assign({}, state, {
        shouldConnect: true,
        pincodeRequired: false,
      })

    case CHAT_PINCODE_REQUIRED:
      return Object.assign({}, state, {
        pincodeRequired: true
      })

    case CHAT_USE_PARANOID_MODE:
      return Object.assign({}, state, {
        pincodeRequired: true,
        paranoidMode: true,
        username: PARANOID_USERNAME,
      })

    case CHAT_INIT_CONNECTION:
      return Object.assign({}, state, {
        messages: [],
        connecting: true,
        connected: false,
        shouldConnect: false,
        pincodeRequired: false,
        ready: false,
        usernameRequired: !state.username,
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
      console.log(CHAT_USERNAME_SET)
      return Object.assign({}, state, {
        username: action.username,
        status: 'viewing',
        usernameRequired: false
      });

    default:
      return state;
  }
}

export default chatReducer;
