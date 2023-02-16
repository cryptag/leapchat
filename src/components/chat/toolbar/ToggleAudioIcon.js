import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import FaVolumeUp from 'react-icons/lib/fa/volume-up';
import FaVolumeOff from 'react-icons/lib/fa/volume-off';

const disableAudioTooltip = (
  <Tooltip id="mute-audio">Mute Audio</Tooltip>
);

const enableAudioTooltip = (
  <Tooltip id="enable-audio">Enable Audio</Tooltip>
);

const DisableAudioIcon = ({ onSetIsAudioEnabled }) => (
  <OverlayTrigger overlay={disableAudioTooltip} placement="top" delayShow={300} delayHide={150}>
    <FaVolumeUp size={24}  onClick={() => onSetIsAudioEnabled(false)} />
  </OverlayTrigger>
);

const EnableAudioIcon = ({ onSetIsAudioEnabled }) => (
  <OverlayTrigger overlay={enableAudioTooltip} placement="top" delayShow={300} delayHide={150}>
    <FaVolumeOff size={24} onClick={() => onSetIsAudioEnabled(true)} />
  </OverlayTrigger>
);

const ToggleAudioIcon = ({ isAudioEnabled, onSetIsAudioEnabled }) => {
  return (
    <div className="toggle-audio">
      {isAudioEnabled && <DisableAudioIcon onSetIsAudioEnabled={onSetIsAudioEnabled} />}
      {!isAudioEnabled && <EnableAudioIcon onSetIsAudioEnabled={onSetIsAudioEnabled} />}
    </div>
  );
};

ToggleAudioIcon.propTypes = {
  onSetIsAudioEnabled: PropTypes.func.isRequired,
  isAudioEnabled: PropTypes.bool.isRequired,
};

export default ToggleAudioIcon;
