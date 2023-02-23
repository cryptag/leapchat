import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import { FaVolumeUp } from 'react-icons/fa';
import { FaVolumeMute } from 'react-icons/fa';
import { disableAudio, enableAudio } from '../../../store/actions/settingsActions';

const disableAudioTooltip = (
  <Tooltip id="mute-audio">Mute Audio</Tooltip>
);

const enableAudioTooltip = (
  <Tooltip id="enable-audio">Enable Audio</Tooltip>
);

const DisableAudioIcon = ({ onSetIsAudioEnabled }) => (
  // <OverlayTrigger overlay={disableAudioTooltip} placement="top" delayShow={300} delayHide={150}>
  // </OverlayTrigger>
  <FaVolumeUp size={24} onClick={() => disableAudio()} />
);

const EnableAudioIcon = ({ onSetIsAudioEnabled }) => (
  // <OverlayTrigger overlay={enableAudioTooltip} placement="top" delayShow={300} delayHide={150}>
  // </OverlayTrigger>
  <FaVolumeMute size={24} onClick={() => enableAudio()} />
);

const ToggleAudioIcon = ({
  isAudioEnabled,
  enableAudio,
  disableAudio,
}) => {
  return (
    <div className="toggle-audio">
      {isAudioEnabled && <FaVolumeUp size={24} onClick={() => disableAudio()} />}
      {!isAudioEnabled && <FaVolumeMute size={24} onClick={() => enableAudio()} />}
    </div>
  );
};

ToggleAudioIcon.propTypes = {};

const mapStateToProps = (reduxState) => {
  return {
    isAudioEnabled: reduxState.settings.isAudioEnabled,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    enableAudio: () => dispatch(enableAudio()),
    disableAudio: () => dispatch(disableAudio()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ToggleAudioIcon);
