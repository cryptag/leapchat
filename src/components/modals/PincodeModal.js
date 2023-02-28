import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Modal, Button } from 'react-bootstrap';

import { genPassphrase } from '../../data/minishare';

class PincodeModal extends PureComponent {
 
  componentDidMount() {
    this.pincodeInput.focus();
  }
  
  componentDidUpdate(){
    if(this.props.showModal){
      this.pincodeInput.focus();
    }
  }

  onPincodeKeyPress = (e) => {
    if (e.which === 13) {
      this.onSetPincodeClick();
    }
  };

  isPincodeValid(pincode) {
    if (!pincode || pincode.endsWith("--")) {
      return false;
    }
    return true;
  }

  onSetPincodeClick = (e) => {
    const pincode = this.pincodeInput.value;

    if (!this.isPincodeValid(pincode)) {
      alert('Invalid pincode!');
    } else {
      this.props.onSetPincode(pincode);
    }
  };

  setRandomPincodeInForm = () => {
    this.pincodeInput.value = genPassphrase(2);
  };

  onClose = () => {
    this.props.onToggleModalVisibility('pincode', false);
  };

  render() {
    let { showModal, pincode } = this.props;

    return (
      <div>
        <Modal show={showModal} onHide={this.onClose}>
          <Modal.Header>
            <Modal.Title>Set Pincode</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <input 
                type="text" 
                className="form-control" 
                ref={(input) => { this.pincodeInput = input; }}
                defaultValue={pincode} 
                placeholder="Enter pincode or password" 
                onKeyPress={this.onPincodeKeyPress} 
                autoFocus={true} />
              <br />
              <Button size="sm" variant="primary" onClick={this.setRandomPincodeInForm}>Generate Random Pincode</Button>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {pincode && <Button onClick={this.onClose}>Cancel</Button>}
            <Button onClick={this.onSetPincodeClick} variant="primary">Set Pincode</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}


PincodeModal.propType = {
  showModal: PropTypes.bool.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired,
  onSetPincode: PropTypes.func.isRequired
};

export default PincodeModal;
