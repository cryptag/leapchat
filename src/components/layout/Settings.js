import React, { useState } from 'react';
import { PropTypes } from 'prop-types';

import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import { FaCog } from 'react-icons/fa';

import SettingsModal from '../modals/SettingsModal';

const settingsTooltip = (
  <Tooltip id="open-settings-tooltip">Open Settings</Tooltip>
);

const Settings = () => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <div className="settings" >
      {/* <OverlayTrigger placement="bottom" overlay={settingsTooltip} delayShow={300} delayHide={150}> */}
      {/* </OverlayTrigger> */}
      <FaCog size={27} onClick={() => setShowSettingsModal(true)} />
      {showSettingsModal && <SettingsModal 
        isVisible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)} />}
    </div>
  );
};

Settings.propTypes = {};

export default Settings;
