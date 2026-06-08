import React, { useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import InfoModal from '../modals/InfoModal';

const Info = () => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <>
      <button
        className="sidebar-icon-btn"
        onClick={() => setShowInfoModal(true)}
        title="About LeapChat">
        <FiInfo size={16} />
      </button>
      {showInfoModal && <InfoModal
        isVisible={showInfoModal}
        onClose={() => setShowInfoModal(false)} />}
    </>
  );
};

export default Info;
