import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Alert } from 'react-bootstrap';

import { dismissAlert } from '../../store/actions/alertActions';

// https://v4-alpha.getbootstrap.com/components/alerts/#examples
const alertStyles = ['success', 'danger', 'warning', 'info'];

const AlertContainer = ({
  alertMessage,
  alertStyle,
  dismissAlert,
  alertRenderSeconds,
}) => {
  if (!alertStyles.includes(alertStyle)){
    alertStyle = 'success';
  }

  if (alertRenderSeconds && alertRenderSeconds > 0) {
    // auto-dismiss option
    setTimeout(() => {
      dismissAlert();
    }, alertRenderSeconds * 1000);
  }
  

  return (
    <div className="alert-container" style={{marginRight: '10px'}}>
      {alertMessage && <Alert
        bsStyle={alertStyle}
        onDismiss={dismissAlert}>
        {alertMessage}
      </Alert>}
    </div>
  );
};

AlertContainer.propTypes = {};

const mapStateToProps = (reduxState) => {
  return {
    ...reduxState.alert,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dismissAlert: () => dispatch(dismissAlert()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AlertContainer);
