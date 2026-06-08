import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Button, ProgressBar } from 'react-bootstrap';
import { enableAudio } from '../../store/actions/settingsActions';
import { generateRandomUsername } from '../../data/username';

export const MAX_USERNAME_LENGTH = 45;

const UsernameModal = ({
  isVisible,
  isNewRoom,
  previousUsername,
  username,
  onToggleModalVisibility,
  setUsername,
  enableAudio,
  connecting,
  connected,
}) => {
  const usernameInput = useRef(null);
  const [failMessage, setFailMessage] = useState('');

  const onClose = () => onToggleModalVisibility('username', false);

  const setRandomUsernameInForm = () => {
    usernameInput.current.value = generateRandomUsername();
    usernameInput.current.focus();
  };

  const isUsernameValid = () => {
    const val = usernameInput.current.value;
    if (!val || val.length === 0) { setFailMessage('Username cannot be empty'); return false; }
    if (val.length > MAX_USERNAME_LENGTH) { setFailMessage(`Max ${MAX_USERNAME_LENGTH} characters`); return false; }
    setFailMessage('');
    return true;
  };

  const onSetUsername = () => {
    if (isUsernameValid()) {
      setUsername(usernameInput.current.value);
      const isAudioEnabled = JSON.parse(localStorage.getItem('isAudioEnabled') || 'true');
      if (isAudioEnabled) enableAudio();
      onClose();
    }
  };

  const onKeyUp = (e) => { if (e.which === 13) onSetUsername(); };

  let progress = 0;
  let statusText = 'Preparing secure connection…';
  if (connecting) { progress = 50; statusText = 'Establishing encrypted connection…'; }
  else if (connected) { progress = 100; statusText = 'Connected!'; }

  return (
    <Modal size="lg" show={isVisible} onHide={onClose} centered>
      <Modal.Header closeButton={!!username}>
        <Modal.Title>{username ? 'Edit Username' : 'Set Username'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!username && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: isNewRoom ? 'rgba(94, 106, 210, 0.08)' : 'rgba(34, 197, 94, 0.08)',
            border: `1px solid ${isNewRoom ? 'rgba(94,106,210,0.2)' : 'rgba(34,197,94,0.2)'}`,
            marginBottom: '16px',
            fontSize: '13px',
            color: isNewRoom ? 'var(--accent)' : 'var(--success)',
            fontWeight: 500,
          }}>
            {isNewRoom ? '🔐 New encrypted room created' : '✓ Room joined successfully'}
          </div>
        )}

        <label className="form-label">Username</label>
        <input
          id="username"
          type="text"
          className="form-control"
          ref={usernameInput}
          defaultValue={username || previousUsername}
          placeholder="e.g., trinity"
          onKeyUp={onKeyUp}
          autoFocus
          autoComplete="off"
          style={{ marginBottom: '8px' }} />

        {failMessage && (
          <div className="alert alert-danger" style={{ marginBottom: '8px' }}>
            {failMessage}
          </div>
        )}

        <Button size="sm" variant="light" onClick={setRandomUsernameInForm}>
          Generate random username
        </Button>

        {!connected && (
          <div className="progress-indicator">
            <p>{statusText}</p>
            <ProgressBar animated now={progress} style={{ height: '4px' }} />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {username && <Button variant="light" onClick={onClose}>Cancel</Button>}
        <Button onClick={onSetUsername} variant="primary" disabled={!connected}>
          {username ? 'Save' : 'Join Room'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

UsernameModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  isNewRoom: PropTypes.bool.isRequired,
  previousUsername: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired,
  setUsername: PropTypes.func.isRequired,
  connecting: PropTypes.bool.isRequired,
  connected: PropTypes.bool.isRequired,
};

const mapDispatchToProps = (dispatch) => ({ enableAudio: () => dispatch(enableAudio()) });
export default connect(null, mapDispatchToProps)(UsernameModal);
