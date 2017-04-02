import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

import { Modal, Button } from 'react-bootstrap';

class UsernameModal extends Component {
  constructor(){
    super(...arguments);

    this.onUsernameKeyPress = this.onUsernameKeyPress.bind(this);
    this.onSetUsernameClick = this.onSetUsernameClick.bind(this);
  }

  componentDidMount(){
    $(findDOMNode(this.refs.username)).find('input').focus();
  }

  onUsernameKeyPress(e){
    if(e.which === 13){
      this.onSetUsernameClick();
    }
  }

  onSetUsernameClick(e){
    let { onSetUsername } = this.props;
    let usernameBox = $(findDOMNode(this.refs.username));
    let username = usernameBox.find('input').val();

    if (!username || username.length === 0){
      alert("Invalid username!");
    } else {
      onSetUsername(username);
    }
  }

  render(){
    let { showModal, username, onCloseModal } = this.props;

    return (
      <div>
        <Modal show={showModal} onHide={this.onCloseModal}>
          <Modal.Header>
            <Modal.Title>Set Username</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group" ref="username">
              <input type="text" className="form-control" defaultValue={username} placeholder="Enter username (e.g., trinity)" onKeyPress={this.onUsernameKeyPress} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={onCloseModal}>Cancel</Button>
            <Button onClick={this.onSetUsernameClick} bsStyle="primary">Set Username</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}


UsernameModal.propType = {
  showModal: PropTypes.bool.isRequired,
  username: PropTypes.string.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onSetUsername: PropTypes.func.isRequired
}

export default UsernameModal;