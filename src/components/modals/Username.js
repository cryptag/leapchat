import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Modal, Button } from 'react-bootstrap';

import { generateRandomUsername } from '../../data/username';

export const MAX_USERNAME_LENGTH = 45;

const UsernameModal = ({
  isVisible,
  previousUsername,
  username,
  onToggleModalVisibility,
  setUsername,
  onSetIsAudioEnabled
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
    onSetIsAudioEnabled(isAudioEnabled);
  };

  const onSetUsername = () => {
    if (isUsernameValid()) {
      setUsername(usernameInput.current.value);
      setDefaultAudio();
      onClose();
    }
  };

  return (
    <div>
      <Modal show={isVisible} onHide={onClose}>
        <Modal.Header>
          <Modal.Title>Set Username</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div data-testid="set-username-form" className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              type="text"
              className="form-control"
              ref={usernameInput}
              defaultValue={ username || previousUsername }
              placeholder="Enter username (e.g., trinity)" 
              onKeyUp={onUsernameKeyUp}
              autoFocus={true}
              autoComplete="off" />
            <br />
            {failMessage && <div className="alert alert-danger" role="alert" >
              <strong>Invalid Username: </strong>
              {failMessage}
            </div>}
            <Button bsSize="xsmall" bsStyle="primary" onClick={setRandomUsernameInForm}>Generate Random Username</Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {username && <Button onClick={onClose}>Cancel</Button>}
          <Button data-testid="set-username" onClick={onSetUsername} bsStyle="primary">Set Username</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

UsernameModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  previousUsername: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired,
  setUsername: PropTypes.func.isRequired,
  onSetIsAudioEnabled: PropTypes.func.isRequired,
};

export default UsernameModal;
