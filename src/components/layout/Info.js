import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import { FaInfoCircle } from 'react-icons/fa';

import InfoModal from '../modals/InfoModal';

const infoTooltip = (
  <Tooltip id="open-info-tooltip">Open LeapChat Info</Tooltip>
);

const Info = () => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <div className="info">
      <FaInfoCircle onClick={() => setShowInfoModal(true)} size={19}/>
      {showInfoModal && <InfoModal
        isVisible={showInfoModal}
        onClose={() => setShowInfoModal(false)} />}
    </div>
  );
};

Info.propTypes = {};

export default Info;
