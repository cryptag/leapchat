import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Modal, Button } from 'react-bootstrap';

import { generateRandomUsername } from '../../data/username';

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
    } else if (username.length > 45) {
      this.setState({ failMessage: 'Length must not exceed 45' });
      return false;
    } else {
      return true;
    }
  }

  onSetUsernameClick = (e) => {
    const username = this.usernameInput.value;

    if (this.isUsernameValid(username)) {
      this.props.onSetUsername(username);
    }
  }

  setRandomUsernameInForm = () => {
    this.usernameInput.value = generateRandomUsername();
  }

  displayFailAlert = () => {
    if (!!this.state.failMessage) {
      return { display: 'block' };
    } else {
      return { display: 'none' };
    }
  }

  render() {
    const { showModal, previousUsername, username, onCloseModal } = this.props;

    return (
      <div>
        <Modal show={showModal} onHide={this.onCloseModal}>
          <Modal.Header>
            <Modal.Title>Set Username</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <input 
                type="text"
                className="form-control"
                ref={(input) => { this.usernameInput = input; }}
                defaultValue={ username || previousUsername }
                placeholder="Enter username (e.g., trinity)" 
                onKeyPress={this.onUsernameKeyPress} 
                autoFocus={true} />
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
