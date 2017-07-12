export const CHAT_ADD_MESSAGE = 'CHAT_ADD_MESSAGE';
export const CHAT_SET_USER_STATUS = 'CHAT_SET_USER_STATUS';
export const CHAT_CLEAR_MESSAGES = 'CHAT_CLEAR_MESSAGES';
export const CHAT_SET_USERNAME = 'CHAT_SET_USERNAME';

export const addMessage = ({ key, fromUsername, maybeSenderId, message }) =>
    ({ type: CHAT_ADD_MESSAGE, key, fromUsername, maybeSenderId, message })

export const clearMessages = () =>
    ({ type: CHAT_CLEAR_MESSAGES })

export const addUserStatus = ({ fromUsername, userStatus, created }) =>
    ({ type: CHAT_SET_USER_STATUS, fromUsername, userStatus, created })

export const setUsername = (username) =>
    ({ type: CHAT_SET_USERNAME, username })