import {
    CHAT_ADD_MESSAGE,
    CHAT_SET_USER_STATUS,
    CHAT_CLEAR_MESSAGES,
    CHAT_SET_USERNAME
} from '../actions/chatActions';

const initialState = {
    username: '',
    messages: [],
    statuses: []
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

        default:
            return state;
    }
}

export default chatReducer;