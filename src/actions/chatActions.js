export const CHAT_ADD_MESSAGE = 'CHAT_ADD_MESSAGE';
export const CHAT_SET_USER_STATUS = 'CHAT_SET_USER_STATUS';
export const CHAT_CLEAR_MESSAGES = 'CHAT_CLEAR_MESSAGES';
export const CHAT_SET_USERNAME = 'CHAT_SET_USERNAME';
import { emojiIndex } from 'emoji-mart';
const filterSuggestions = (start, value) => {
  console.log(value.slice(start), 'start', start, value)
  // return list.filter((suggestion) => suggestion.startsWith(value.slice(start)))
  return emojiIndex.search(value.slice(start + 1));
}
export const addMessage = ({ key, fromUsername, maybeSenderId, message }) =>
  ({ type: CHAT_ADD_MESSAGE, key, fromUsername, maybeSenderId, message });

export const clearMessages = () =>
  ({ type: CHAT_CLEAR_MESSAGES });

export const addUserStatus = ({ fromUsername, userStatus, created }) =>
  ({ type: CHAT_SET_USER_STATUS, fromUsername, userStatus, created });

export const setUsername = (username) =>
  ({ type: CHAT_SET_USERNAME, username });

export const messageUpdate = (e) =>
  ({type: 'CHAT_MESSAGE_UPDATE', message: e.target.value});

export const clearMessage = () =>
  ({type: 'CHAT_MESSAGE_CLEAR'});

export const togglePicker = () =>
  ({type: 'CHAT_TOGGLE_PICKER'});

export const addEmoji = (emoji, selectionStart) =>
  ({type: 'CHAT_ADD_EMOJI', emoji, selectionStart});

export const closePicker = () =>
  ({type: 'CHAT_CLOSE_PICKER'});

export const emojiSuggestions = (cursorIndex) =>
  ({type: 'CHAT_START_SUGGESTIONS', cursorIndex });

export const showSuggestions = (cursorIndex, value) =>
  ({type: 'CHAT_SHOW_SUGGESTIONS', suggestions: filterSuggestions(cursorIndex, value)});
