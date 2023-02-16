import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Modal, Button } from 'react-bootstrap';

import { generateRandomUsername } from '../../data/username';

export const MAX_USERNAME_LENGTH = 45;

class UsernameModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { failMessage: '' };
  }

  componentDidMount() {
    this.usernameInput.focus();
  }

  componentDidUpdate(){
    if (this.props.showModal) {
      this.usernameInput.focus();
    }
  }

  onUsernameKeyPress = (e) => {
    if (e.which === 13) {
      this.onSetUsernameClick();
    }
  }

  isUsernameValid(username) {
    if (!username || username.length === 0) {
      this.setState({ failMessage: 'Must not be empty' });
      return false;
    } else if (username.length > MAX_USERNAME_LENGTH) {
      this.setState({ failMessage: `Length must not exceed ${MAX_USERNAME_LENGTH}` });
      return false;
    } else {
      return true;
    }
  }

  onSetUsernameClick = (e) => {
    const username = this.usernameInput.value;

    if (this.isUsernameValid(username)) {
      this.props.onSetUsername(username);
      // set the audio to the user's previously selected preference; enable by default
      let isAudioEnabled = JSON.parse(localStorage.getItem('isAudioEnabled') || 'true');
      this.props.onSetIsAudioEnabled(isAudioEnabled);
    }
  }

  setRandomUsernameInForm = () => {
    this.usernameInput.value = generateRandomUsername();
    this.usernameInput.focus();
  }

  displayFailAlert = () => {
    if (!!this.state.failMessage) {
      return { display: 'block' };
    } else {
      return { display: 'none' };
    }
  }

  render() {
    const {
      isVisible,
      previousUsername,
      username,
      onCloseModal
    } = this.props;

    return (
      <div>
        <Modal show={isVisible} onHide={onCloseModal}>
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
                ref={(input) => { this.usernameInput = input; }}
                defaultValue={ username || previousUsername }
                placeholder="Enter username (e.g., trinity)" 
                onKeyPress={this.onUsernameKeyPress} 
                autoFocus={true}
                autoComplete="off" />
              <br />
              <div className="alert alert-danger" role="alert" style={this.displayFailAlert()} >
                <strong>Invalid Username: </strong>
                {this.state.failMessage}
              </div>
              <Button bsSize="xsmall" bsStyle="primary" onClick={this.setRandomUsernameInForm}>Generate Random Username</Button>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {username && <Button onClick={onCloseModal}>Cancel</Button>}
            <Button data-testid="set-username" onClick={this.onSetUsernameClick} bsStyle="primary">Set Username</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

UsernameModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  previousUsername: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onSetUsername: PropTypes.func.isRequired,
  onSetIsAudioEnabled: PropTypes.func.isRequired,
};

export default UsernameModal;
