import {
  ENABLE_AUDIO,
  DISABLE_AUDIO,
  SET_THEME,
} from '../actions/settingsActions';

const savedTheme = localStorage.getItem('theme') || 'light';

const initialState = {
  isAudioEnabled: false,
  theme: savedTheme,
};

function settingsReducer(state = initialState, action) {
  switch (action.type) {
  case ENABLE_AUDIO:
    localStorage.setItem('isAudioEnabled', action.isAudioEnabled);
    return { ...state, isAudioEnabled: action.isAudioEnabled };

  case DISABLE_AUDIO:
    localStorage.setItem('isAudioEnabled', action.isAudioEnabled);
    return { ...state, isAudioEnabled: action.isAudioEnabled };

  case SET_THEME:
    localStorage.setItem('theme', action.theme);
    return { ...state, theme: action.theme };

  default:
    return state;
  }
}

export default settingsReducer;
