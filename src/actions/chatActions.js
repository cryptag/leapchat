
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


