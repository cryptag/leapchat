import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import { FaShareAltSquare } from 'react-icons/fa';

import SharingModal from '../../modals/SharingModal';

const shareChatTooltip = (
  <Tooltip id="share-chat">Invite to Chat</Tooltip>
);

const InviteIcon = () => {

  const [showSharingModal, setShowSharingModal] = useState(false);

  return (
    <div className="sharing">
      {/* <OverlayTrigger overlay={shareChatTooltip} placement="top" delayShow={300} delayHide={150}> */}
      {/* </OverlayTrigger> */}
      <FaShareAltSquare size={24} onClick={() => setShowSharingModal(true)} />
      {showSharingModal && <SharingModal
        isVisible={showSharingModal}
        onClose={() => setShowSharingModal(false)} />}
    </div>
  );
};

InviteIcon.propTypes = {};

export default InviteIcon;
