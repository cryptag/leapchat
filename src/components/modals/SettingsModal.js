import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { FiExternalLink, FiSun, FiMoon } from 'react-icons/fi';
import { chatHandler } from '../../store/epics/chatEpics';
import { setTheme } from '../../store/actions/settingsActions';

const onDeleteAllMsgs = () => {
  if (window.confirm('Delete every message in this room permanently for all users?')) {
    chatHandler.sendDeleteAllMessagesSignalToServer();
  }
};

const SettingsModal = ({ isVisible, onClose, theme, setTheme }) => {
  const isDark = theme === 'dark';

  return (
    <Modal size="lg" show={isVisible} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="settings-section">
          <h3>Appearance</h3>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Color mode</div>
              <div className="settings-row-desc">Choose between light and dark interface</div>
            </div>
            <Button
              size="sm"
              variant="light"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isDark ? <><FiSun size={14} /> Light</> : <><FiMoon size={14} /> Dark</>}
            </Button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Feedback</h3>
          <p>
            Have suggestions?{' '}
            <a href="https://github.com/cryptag/leapchat/issues" target="_blank" rel="nofollow noreferrer noopener">
              Share feedback <FiExternalLink size={13} style={{ verticalAlign: 'middle' }} />
            </a>
          </p>
        </div>

        <div className="settings-section danger-section">
          <h3>Danger Zone</h3>
          <p>Permanently deletes all messages in this room for everyone.</p>
          <Button onClick={onDeleteAllMsgs} variant="danger" size="sm">
            Delete All Messages Forever
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

SettingsModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ theme: state.settings.theme });
export default connect(mapStateToProps, { setTheme })(SettingsModal);
