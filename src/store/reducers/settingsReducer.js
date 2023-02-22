import {
  ENABLE_AUDIO,
  DISABLE_AUDIO,
} from '../actions/settingsActions';


const initialState = {
  // Default to false on initial render so audio doesn't attempt to play before 
  // user interacts with page (which triggers console.error)
  isAudioEnabled: false
};

function settingsReducer(state = initialState, action) {

  switch (action.type) {
  case ENABLE_AUDIO:
    localStorage.setItem("isAudioEnabled", action.isAudioEnabled);
    return {
      isAudioEnabled: action.isAudioEnabled
    };

  case DISABLE_AUDIO:
    localStorage.setItem("isAudioEnabled", action.isAudioEnabled);
    return {
      isAudioEnabled: action.isAudioEnabled
    };

  default:
    return state;
  }
}

export default settingsReducer;
