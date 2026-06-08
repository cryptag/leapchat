import React, { useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import SharingModal from '../../modals/SharingModal';

const InviteIcon = () => {
  const [showSharingModal, setShowSharingModal] = useState(false);

  return (
    <>
      <button className="chat-tool-btn" onClick={() => setShowSharingModal(true)} title="Invite people">
        <FiUserPlus size={18} />
      </button>
      {showSharingModal && <SharingModal
        isVisible={showSharingModal}
        onClose={() => setShowSharingModal(false)} />}
    </>
  );
};

export default InviteIcon;
