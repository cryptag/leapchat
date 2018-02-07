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
const previousUsername = localStorage && localStorage.getItem(USERNAME_KEY) || '';

const initialState = {
  connecting: false,
  connected: false,
  shouldConnect: true,
  pincodeRequired,
  paranoidMode,
  username: paranoidMode ? PARANOID_USERNAME : '',
  previousUsername: previousUsername,
  status: '',
  messages: [],
  statuses: [],
  message: '',
  showEmojiPicker: false,
  suggestionStart: null,
  suggestions: [],
  suggestionWord: '',
  highlightedSuggestion: null
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
         }],
         suggestionStart: null,
         suggestions: []
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

  case 'CHAT_MESSAGE_UPDATE':
    return Object.assign({}, state, {
      message: action.message
    });

  case 'CHAT_MESSAGE_CLEAR':
    return Object.assign({}, state, {
      message: ''
    });

  case 'CHAT_TOGGLE_PICKER':
    return Object.assign({}, state, {
      showEmojiPicker: !state.showEmojiPicker
  });

  case 'CHAT_ADD_EMOJI':
    const beforeEmoji = state.message.slice(0, action.selectionStart);
    const afterEmoji = state.message.slice(action.selectionStart);
    return Object.assign({}, state, {
      showEmojiPicker: false,
      message: beforeEmoji + action.emoji + ' ' + afterEmoji
  });

  case 'CHAT_CLOSE_PICKER':
    return Object.assign({}, state, {
      showEmojiPicker: false
  });

  case 'CHAT_START_SUGGESTIONS':
    return Object.assign({}, state, {
      suggestionStart: action.cursorIndex
    });

  case 'CHAT_SHOW_SUGGESTIONS':
    return  action.suggestions ? Object.assign({}, state, {
        suggestions: action.suggestions.slice(0, 25) || [],
        suggestionWord: state.message.slice(state.suggestionStart),
        highlightedSuggestion: 0
    }) : state;

  case 'CHAT_ADD_SUGGESTION':
    const beforeSuggestion = state.message.slice(0, state.suggestionStart);
    const afterSuggestion = state.message.slice(state.suggestionStart)
    const formattedSuggestion = afterSuggestion.replace(state.suggestionWord, action.suggestion + ' ')
    return Object.assign({}, state, {
      message: beforeSuggestion + formattedSuggestion,
      suggestionWord: action.suggestion
    });

  case 'CHAT_STOP_SUGGESTIONS':
    return Object.assign({}, state, {
      suggestionStart: null,
      suggestions: []
    });

  case 'CHAT_DOWN_SUGGESTION':
    return Object.assign({}, state, {
      highlightedSuggestion: state.suggestions[state.highlightedSuggestion + 1]
      ? ++state.highlightedSuggestion
      : 0
    });

  case 'CHAT_UP_SUGGESTION':
    return Object.assign({}, state, {
      highlightedSuggestion: state.suggestions[state.highlightedSuggestion - 1]
      ? --state.highlightedSuggestion
      : state.suggestions.length - 1
    });

  default:
    return state;
  }
}

export default chatReducer;
