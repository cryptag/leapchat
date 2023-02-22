export const ENABLE_AUDIO = 'ENABLE_AUDIO';
export const DISABLE_AUDIO = 'DISABLE_AUDIO';

export const enableAudio = () =>
  ({ type: ENABLE_AUDIO, isAudioEnabled: true });

export const disableAudio = () =>
  ({ type: DISABLE_AUDIO, isAudioEnabled: false });