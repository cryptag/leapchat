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
  showEmojiPicker: false,
  suggestionStart: null,
  suggestions: [],
  suggestionWord: '',
  highlightedSuggestion: null
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

  case 'CHAT_TOGGLE_PICKER':
    return Object.assign({}, state, {
      showEmojiPicker: !state.showEmojiPicker
  });

  case 'CHAT_ADD_EMOJI':
    return Object.assign({}, state, {
      showEmojiPicker: false,
      message: `${state.message.slice(0, action.selectionStart)}${action.emoji}${state.message.slice(action.selectionStart)}`
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
        suggestions: action.suggestions.slice(0, 25),
        suggestionWord: state.message.slice(state.suggestionStart),
        highlightedSuggestion: 0
    }) : state;

  case 'CHAT_ADD_SUGGESTION':
    return Object.assign({}, state, {
      message: `${state.message.slice(0, state.suggestionStart)}${state.message.slice(state.suggestionStart).replace(state.suggestionWord, action.suggestion)}`
    });

  case 'CHAT_STOP_SUGGESTIONS':
    return Object.assign({}, state, {
      suggestionStart: null,
      suggestions: []
    });

  case 'CHAT_DOWN_SUGGESTION':
    return Object.assign({}, state, {
      highlightedSuggestion: state.suggestions[state.highlightedSuggestion + 1] ?
        ++state.highlightedSuggestion : 0
    });

  case 'CHAT_UP_SUGGESTION':
    return Object.assign({}, state, {
      highlightedSuggestion: state.suggestions[state.highlightedSuggestion - 1] ?
        --state.highlightedSuggestion : state.suggestions.length - 1
    });

  default:
    return state;
  }
}

export default chatReducer;
