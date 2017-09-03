import {
  CHAT_ADD_MESSAGE,
  CHAT_SET_USER_STATUS,
  CHAT_CLEAR_MESSAGES,
  CHAT_SET_USERNAME
} from '../actions/chatActions';

const initialState = {
  username: '',
  messages: [],
  statuses: [],
  message: '',
  showEmojiPicker: false
};

function chatReducer(state = initialState, action) {

  switch (action.type) {

  case CHAT_ADD_MESSAGE:
    return Object.assign({}, state, {
      messages: [...state.messages, {
        key: action.key,
        from: action.fromUsername + action.maybeSenderId,
        msg: action.message
      }]
    });

  case CHAT_CLEAR_MESSAGES:
    return Object.assign({}, state, {
      messages: []
    });

  case CHAT_SET_USER_STATUS:
    return Object.assign({}, state, {
      statuses: [...state.statuses, {
        from: action.fromUsername,
        status: action.userStatus,
        created: action.created
      }]
    });

  case CHAT_SET_USERNAME:
    return Object.assign({}, state, {
      username: action.username
    });

  case 'CHAT_MESSAGE_UPDATE':
    return Object.assign({}, state, {
      message: action.message
    });

  case 'CHAT_MESSAGE_CLEAR':
    return Object.assign({}, state, {
      message: ''
    });

  case 'TOGGLE_PICKER':
    return Object.assign({}, state, {
      showEmojiPicker: !state.showEmojiPicker
  });

  case 'ADD_EMOJI':
    return Object.assign({}, state, {
      showEmojiPicker: false,
      message: `${state.message.slice(0, action.selectionStart)}${action.emoji}${state.message.slice(action.selectionStart)}`
  });

  case 'CLOSE_PICKER':
    return Object.assign({}, state, {
      showEmojiPicker: false
  });

  default:
    return state;
  }
}

export default chatReducer;
