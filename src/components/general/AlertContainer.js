import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

import { Alert } from 'react-bootstrap';

class AlertContainer extends Component {
  constructor(props){
    super(props);
  }

  render(){
    let { showAlert, message, alertStyle, onAlertDismiss } = this.props;
    if (['success', 'error', 'warning'].indexOf(alertStyle) === -1){
      alertStyle = 'success';
    }

    return (
      <div className="alert-container" ref="alert_container">
        {showAlert && <Alert className={alertStyle} onDismiss={onAlertDismiss}>
          {message}
        </Alert>}
      </div>
    );
  }
}

AlertContainer.propTypes = {
  showAlert: PropTypes.bool,
  message: PropTypes.string.isRequired,
  alertStyle: PropTypes.string,
  onAlertDismiss: PropTypes.func.isRequired
}

export default AlertContainer;
