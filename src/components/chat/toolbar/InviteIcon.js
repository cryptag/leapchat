import React from 'react';
import PropTypes from 'prop-types';

import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import { FaShareAltSquare } from 'react-icons/fa';

const shareChatTooltip = (
  <Tooltip id="share-chat">Invite to Chat</Tooltip>
);

const InviteIcon = ({ onToggleModalVisibility }) => {

  const showSharingModal = () => {
    onToggleModalVisibility('sharing', true);
  };

  return (
    <div className="sharing">
      <OverlayTrigger overlay={shareChatTooltip} placement="top" delayShow={300} delayHide={150}>
        <FaShareAltSquare size={24} onClick={showSharingModal} />
      </OverlayTrigger>
    </div>
  );
};

InviteIcon.propTypes = {
  onToggleModalVisibility: PropTypes.func.isRequired
};

export default InviteIcon;
