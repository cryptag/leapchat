import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

import { Alert } from 'react-bootstrap';

// https://v4-alpha.getbootstrap.com/components/alerts/#examples
const alertStyles = ['success', 'danger', 'warning', 'info'];

class AlertContainer extends Component {
  constructor(props){
    super(props);
  }

  render(){
    let { message, alertStyle, onAlertDismiss } = this.props;
    if (!alertStyles.includes(alertStyle)){
      alertStyle = 'success';
    }

    return (
      <div className="alert-container" ref="alert_container">
        {message && <Alert
                      bsStyle={alertStyle}
                      onDismiss={onAlertDismiss}>
                        {message}
                    </Alert>}
      </div>
    );
  }
}

AlertContainer.propTypes = {
  message: PropTypes.string.isRequired,
  alertStyle: PropTypes.string,
  onAlertDismiss: PropTypes.func.isRequired
}

export default AlertContainer;
