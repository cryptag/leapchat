import React, { Component } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';

import { Modal, Button } from 'react-bootstrap';

import { generateRandomUsername } from '../../data/username';

class UsernameModal extends Component {
  constructor() {
    super(...arguments);

    this.onUsernameKeyPress = this.onUsernameKeyPress.bind(this);
    this.onSetUsernameClick = this.onSetUsernameClick.bind(this);
    this.setRandomUsernameInForm = this.setRandomUsernameInForm.bind(this);
  }

  componentDidMount() {
    this.giveFormFocus()
  }

  // TODO: destroy this madness when possible, very un-React.
  getUsernameInputElement() {
    return $(this.refs.username);
  }

  giveFormFocus() {
    this.getUsernameInputElement().focus()
  }

  getUsernameInputValue() {
    return this.getUsernameInputElement().val();
  }

  setUsernameInputValue(newUsername) {
    this.getUsernameInputElement().val(newUsername);
  }

  onUsernameKeyPress(e) {
    if (e.which === 13) {
      this.onSetUsernameClick();
    }
  }

  isUsernameValid(username) {
    if (!username || username.length === 0) {
      return false;
    }
    return true;
  }

  onSetUsernameClick(e) {
    let username = this.getUsernameInputValue()

    if (!this.isUsernameValid(username)) {
      alert('Invalid username!');
    } else {
      this.props.onSetUsername(username);
    }
  }

  setRandomUsernameInForm() {
    let randomUsername = generateRandomUsername();
    this.setUsernameInputValue(randomUsername);
  }

  render() {
    let { showModal, previousUsername, username, onCloseModal } = this.props;

    return (
      <div>
        <Modal show={showModal} onHide={this.onCloseModal}>
          <Modal.Header>
            <Modal.Title>Set Username</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <input type="text" className="form-control" ref="username" defaultValue={username || previousUsername} placeholder="Enter username (e.g., trinity)" onKeyPress={this.onUsernameKeyPress} />
              <br />
              <Button bsSize="xsmall" bsStyle="primary" onClick={this.setRandomUsernameInForm}>Generate Random Username</Button>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {username && <Button onClick={onCloseModal}>Cancel</Button>}
            <Button onClick={this.onSetUsernameClick} bsStyle="primary">Set Username</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}


UsernameModal.propType = {
  showModal: PropTypes.bool.isRequired,
  previousUsername: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onSetUsername: PropTypes.func.isRequired
}

export default UsernameModal;
