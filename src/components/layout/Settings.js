import React from 'react';
import { PropTypes } from 'prop-types';

import FaCog from 'react-icons/lib/fa/cog';

const Settings = ({ onShowSettingsModal }) => {
  return (
    <div className="settings" >
      <FaCog size={30} onClick={onShowSettingsModal} />
    </div>
  );
};

Settings.propTypes = {
  onShowSettingsModal: PropTypes.func.isRequired
};

export default Settings;
