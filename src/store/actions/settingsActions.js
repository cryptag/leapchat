export const ENABLE_AUDIO = 'ENABLE_AUDIO';
export const DISABLE_AUDIO = 'DISABLE_AUDIO';
export const SET_THEME = 'SET_THEME';

export const enableAudio = () =>
  ({ type: ENABLE_AUDIO, isAudioEnabled: true });

export const disableAudio = () =>
  ({ type: DISABLE_AUDIO, isAudioEnabled: false });

export const setTheme = (theme) =>
  ({ type: SET_THEME, theme });
