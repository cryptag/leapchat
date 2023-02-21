import React from 'react';
import { PropTypes } from 'prop-types';

import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import { FaCog } from 'react-icons/fa';

const settingsTooltip = (
  <Tooltip id="open-settings-tooltip">Open Settings</Tooltip>
);

const Settings = ({ onToggleModalVisibility }) => {

  const onShowSettingsModal = () => {
    onToggleModalVisibility('settings', true);
  };

  return (
    <div className="settings" >
      {/* <OverlayTrigger placement="bottom" overlay={settingsTooltip} delayShow={300} delayHide={150}> */}
      {/* </OverlayTrigger> */}
      <FaCog size={30} onClick={onShowSettingsModal} />
    </div>
  );
};

Settings.propTypes = {
  onToggleModalVisibility: PropTypes.func.isRequired
};

export default Settings;
