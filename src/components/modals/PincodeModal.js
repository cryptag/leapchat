import React, { Component } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';

import { Modal, Button } from 'react-bootstrap';

import { genPassphrase } from '../../data/minishare';

class PincodeModal extends Component {
  constructor() {
    super(...arguments);

    this.onPincodeKeyPress = this.onPincodeKeyPress.bind(this);
    this.onSetPincodeClick = this.onSetPincodeClick.bind(this);
    this.setRandomPincodeInForm = this.setRandomPincodeInForm.bind(this);
  }

  componentDidMount() {
    this.giveFormFocus()
  }

  // TODO: destroy this madness when possible, very un-React.
  getPincodeInputElement() {
    return $(this.refs.pincode);
  }

  giveFormFocus() {
    this.getPincodeInputElement().focus()
  }

  getPincodeInputValue() {
    return this.getPincodeInputElement().val();
  }

  setPincodeInputValue(newPincode) {
    this.getPincodeInputElement().val(newPincode);
  }

  onPincodeKeyPress(e) {
    if (e.which === 13) {
      this.onSetPincodeClick();
    }
  }

  isPincodeValid(pincode) {
    if (!pincode || pincode.endsWith("--")) {
      return false;
    }
    return true;
  }

  onSetPincodeClick(e) {
    let pincode = this.getPincodeInputValue()

    if (!this.isPincodeValid(pincode)) {
      alert('Invalid pincode!');
    } else {
      this.props.onSetPincode(pincode);
    }
  }

  setRandomPincodeInForm() {
    let randomPincode = genPassphrase(2);
    this.setPincodeInputValue(randomPincode);
  }

  render() {
    let { showModal, pincode, onCloseModal } = this.props;

    return (
      <div>
        <Modal show={showModal} onHide={this.onCloseModal}>
          <Modal.Header>
            <Modal.Title>Set Pincode</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <input type="text" className="form-control" ref="pincode" defaultValue={pincode} placeholder="Enter pincode or password" onKeyPress={this.onPincodeKeyPress} />
              <br />
              <Button bsSize="xsmall" bsStyle="primary" onClick={this.setRandomPincodeInForm}>Generate Random Pincode</Button>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {pincode && <Button onClick={onCloseModal}>Cancel</Button>}
            <Button onClick={this.onSetPincodeClick} bsStyle="primary">Set Pincode</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}


PincodeModal.propType = {
  showModal: PropTypes.bool.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onSetPincode: PropTypes.func.isRequired
}

export default PincodeModal;
