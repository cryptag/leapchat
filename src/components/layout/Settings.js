import React, { useState } from 'react';
import { connect } from 'react-redux';
import { FiSettings, FiSun, FiMoon } from 'react-icons/fi';
import { setTheme } from '../../store/actions/settingsActions';
import SettingsModal from '../modals/SettingsModal';

const Settings = ({ theme, setTheme }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const isDark = theme === 'dark';

  return (
    <>
      <button
        className="sidebar-icon-btn"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
        {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
      </button>
      <button
        className="sidebar-icon-btn"
        onClick={() => setShowSettingsModal(true)}
        title="Settings">
        <FiSettings size={16} />
      </button>
      {showSettingsModal && <SettingsModal
        isVisible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)} />}
    </>
  );
};

const mapStateToProps = (state) => ({ theme: state.settings.theme });
export default connect(mapStateToProps, { setTheme })(Settings);
