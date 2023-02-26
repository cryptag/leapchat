import {
  ALERT_DISPLAY,
  ALERT_DISMISS
} from '../actions/alertActions';


const initialState = {
  alertMessage: '',
  alertStyle: '',
  alertRenderSeconds: 0,
};

function alertReducer(state = initialState, action) {

  switch (action.type) {
  case ALERT_DISPLAY:
    return {
      alertMessage: action.message,
      alertStyle: action.style,
      alertRenderSeconds: action?.alertRenderSeconds,
    };

  case ALERT_DISMISS:
    return initialState;

  default:
    return state;
  }
}

export default alertReducer;
