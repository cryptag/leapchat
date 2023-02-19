import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import { FaInfoCircle } from 'react-icons/fa';

const infoTooltip = (
  <Tooltip id="open-info-tooltip">Open LeapChat Info</Tooltip>
);

const Info = ({ onToggleModalVisibility }) => {
  const onClose = () => {
    onToggleModalVisibility('info', true);
  };
  
  return (
    <div className="info">
      <OverlayTrigger placement="bottom" overlay={infoTooltip} delayHide={150} delayShow={300}>
        <FaInfoCircle onClick={onClose} size={25}/>
      </OverlayTrigger>
    </div>
  );
};

Info.propTypes = {
  onToggleModalVisibility: PropTypes.func.isRequired
};

export default Info;
