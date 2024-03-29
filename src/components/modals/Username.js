import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Modal, Button, Alert, ProgressBar } from 'react-bootstrap';

import { generateRandomUsername } from '../../data/username';

import { enableAudio } from '../../store/actions/settingsActions';

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

  const [failMessage, setFailMessage ] = useState("");

  const onClose = () => {
    onToggleModalVisibility('username', false);
  };

  const setRandomUsernameInForm = () => {
    usernameInput.current.value = generateRandomUsername();
    usernameInput.current.focus();
  };

  const isUsernameValid = () => {
    const usernameFromForm = usernameInput.current.value;
    if (!usernameFromForm || usernameFromForm.length === 0) {
      setFailMessage("Must not be empty");
      return false;
    } else if (usernameFromForm.length > MAX_USERNAME_LENGTH) {
      setFailMessage(`Length must not exceed ${MAX_USERNAME_LENGTH}`);
      return false;
    }
    setFailMessage("");
    return true;
  };

  const onUsernameKeyUp = (e) => {
    if (e.which === 13) {
      onSetUsername();
    }
  };

  const setDefaultAudio = () => {
    // set the audio to the user's previously selected preference; enable by default
    let isAudioEnabled = JSON.parse(localStorage.getItem('isAudioEnabled') || 'true');
    if (isAudioEnabled){
      enableAudio();
    }
  };

  const onSetUsername = () => {
    if (isUsernameValid()) {
      setUsername(usernameInput.current.value);
      setDefaultAudio();
      onClose();
    }
  };

  let progress = 0;
  let statusMessage = (
    <p>Cranking a bunch of gears.</p>
  );

  if (connecting) {
    progress = 50;
    statusMessage = <p>Creating a secure connection with LeapChat servers.</p>;
  } else if (connected) {
    progress = 95;
    statusMessage = <p>Connected!</p>;
  }

  return (
    <div>
      <Modal size="lg" show={isVisible} onHide={onClose}>
        <Modal.Header>
          <Modal.Title>Set Username</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div data-testid="set-username-form" className="form-group">
            {/* username is empty on initial page load, not on subsequent 'edit username' opens */}
            {!username && isNewRoom && <Alert
              variant="success">
              New room created!
            </Alert>}
            {!username && !isNewRoom && <Alert
              variant="success">
              Successfully joined room!
            </Alert>}
            <label className="form-label" htmlFor="username">Username</label>
            <input 
              style={{marginBottom: "10px"}}
              id="username"
              type="text"
              className="form-control"
              ref={usernameInput}
              defaultValue={ username || previousUsername }
              placeholder="Enter username (e.g., trinity)" 
              onKeyUp={onUsernameKeyUp}
              autoFocus={true}
              autoComplete="off" />
            
            {failMessage && <div className="alert alert-danger" role="alert" >
              <br />
              <strong>Invalid Username: </strong>
              {failMessage}
            </div>}
            <Button size="sm" variant="primary" onClick={setRandomUsernameInForm}>Generate Random Username</Button>
          </div>
          {!connected && <div className="progress-indicator" style={{marginTop: '20px'}}>
            {statusMessage}
            <ProgressBar animated now={progress} label={`${progress}%`} />
          </div>}
        </Modal.Body>
        <Modal.Footer>
          {username && <Button variant="light" onClick={onClose}>Cancel</Button>}
          <Button data-testid="set-username" onClick={onSetUsername} variant="primary" disabled={!connected}>Set Username</Button>
        </Modal.Footer>
      </Modal>
    </div>
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

const mapDispatchToProps = (dispatch) => {
  return {
    enableAudio: () => dispatch(enableAudio()),
  };
};

export default connect(null, mapDispatchToProps)(UsernameModal);
