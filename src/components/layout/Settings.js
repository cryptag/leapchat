import React from 'react';
import { PropTypes } from 'prop-types';

import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import FaCog from 'react-icons/lib/fa/cog';

const settingsTooltip = (
  <Tooltip>Open Settings</Tooltip>
);

const Settings = ({ onShowSettingsModal }) => {
  return (
    <div className="settings" >
      <OverlayTrigger placement="bottom" overlay={settingsTooltip} trigger="hover" delayShow={300} delayHide={150}>
        <FaCog size={30} onClick={onShowSettingsModal} />
      </OverlayTrigger>
    </div>
  );
};

Settings.propTypes = {
  onShowSettingsModal: PropTypes.func.isRequired
};

export default Settings;
