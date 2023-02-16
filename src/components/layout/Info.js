import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import FaInfoCircle from 'react-icons/lib/fa/info-circle';

const infoTooltip = (
  <Tooltip>Open LeapChat Info</Tooltip>
);

export default class Info extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <div className="info">
        <OverlayTrigger placement="bottom" overlay={infoTooltip} trigger="hover" delayHide={150} delayShow={300}>
          <FaInfoCircle onClick={this.props.onToggleInfoModal} size={25}/>
        </OverlayTrigger>
      </div>
    );
  }
}

Info.propTypes = {
  onToggleInfoModal: PropTypes.func.isRequired
};
