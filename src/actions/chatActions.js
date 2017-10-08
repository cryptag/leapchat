
export const CHAT_INIT_CHAT = 'CHAT_INIT_CHAT';
export const CHAT_INIT_CONNECTION = 'CHAT_INIT_CONNECTION';
export const CHAT_DISCONNECTED = 'CHAT_DISCONNECTED';
export const CHAT_CONNECTION_INITIATED = 'CHAT_CONNECTION_INITIATED';
export const CHAT_SEND_MESSAGE = 'CHAT_SEND_MESSAGE';
export const CHAT_MESSAGE_SENT = 'CHAT_MESSAGE_SENT';
export const CHAT_ADD_MESSAGE = 'CHAT_ADD_MESSAGE';
export const CHAT_SET_USER_STATUS = 'CHAT_SET_USER_STATUS';
export const CHAT_USER_STATUS_SENT = 'CHAT_USER_STATUS_SENT';
export const CHAT_SET_USERNAME = 'CHAT_SET_USERNAME';
export const CHAT_USERNAME_SET = 'CHAT_USERNAME_SET';

export const initChat = () => ({ type: CHAT_INIT_CHAT })

export const initConnection = (pincode = '') =>
  ({ type: CHAT_INIT_CONNECTION, pincode });

export const disconnected = () =>
  ({ type: CHAT_DISCONNECTED });

export const connectionInitiated = () =>
  ({ type: CHAT_CONNECTION_INITIATED });

export const sendMessage = ({ message, username }) =>
  ({ type: CHAT_SEND_MESSAGE, message, username });

export const messageSent = () =>
  ({ type: CHAT_MESSAGE_SENT });

export const addMessage = ({ key, fromUsername, maybeSenderId, message }) =>
  ({ type: CHAT_ADD_MESSAGE, key, fromUsername, maybeSenderId, message });

export const setUserStatus = ({ username, status }) =>
  ({ type: CHAT_SET_USER_STATUS, username, status });

export const userStatusSent = () =>
  ({ type: CHAT_USER_STATUS_SENT });

export const setUsername = (username) =>
  ({ type: CHAT_SET_USERNAME, username });

export const usernameSet = (username) =>
  ({ type: CHAT_USERNAME_SET, username });

export const messageUpdate = (e) =>
  ({ type: 'CHAT_MESSAGE_UPDATE', message: e.target.value });

export const clearMessage = () =>
  ({ type: 'CHAT_MESSAGE_CLEAR' });

export const togglePicker = () =>
  ({ type: 'CHAT_TOGGLE_PICKER' });

export const addEmoji = (emoji, selectionStart) =>
  ({ type: 'CHAT_ADD_EMOJI', emoji, selectionStart });

export const closePicker = () =>
  ({ type: 'CHAT_CLOSE_PICKER' });

export const startSuggestions = (cursorIndex, filterSuggestions, list) =>
  ({ type: 'CHAT_START_SUGGESTIONS', cursorIndex, filterSuggestions, list });

export const showSuggestions = (cursorIndex, value, filterSuggestions, list) =>
  ({ type: 'CHAT_SHOW_SUGGESTIONS', suggestions: filterSuggestions(cursorIndex, value, list) });

export const addSuggestion = (suggestion) =>
  ({ type: 'CHAT_ADD_SUGGESTION', suggestion });

export const stopSuggestions = () =>
  ({ type: 'CHAT_STOP_SUGGESTIONS' });

export const downSuggestion = () =>
  ({ type: 'CHAT_DOWN_SUGGESTION' });

export const upSuggestion = () =>
  ({ type: 'CHAT_UP_SUGGESTION' });
