import {
  ALERT_DISPLAY,
  ALERT_DISMISS
} from '../actions/alertActions';


const initialState = {
  alertMessage: '',
  alertStyle: ''
};

function alertReducer(state = initialState, action) {

  switch (action.type) {
    case ALERT_DISPLAY:
      return {
        alertMessage: action.message,
        alertStyle: action.style
      };

    case ALERT_DISMISS:
      return initialState;

    default:
      return state;
  }
}

export default alertReducer;
