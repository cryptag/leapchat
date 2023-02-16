import React from 'react';
import PropTypes from 'prop-types';

import { Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import FaShareAlt from 'react-icons/lib/fa/share-alt';
import FaExternalLink from 'react-icons/lib/fa/external-link';

import { chatHandler } from '../../epics/chatEpics';

const shareLink = window.location.href;

const onDeleteAllMsgs = (e) => {
  if (window.confirm("Are you sure you want to delete every existing chat message from this chat room? This action cannot be undone.")) {
    chatHandler.sendDeleteAllMessagesSignalToServer();
  }
};

const onCopyShareLink = (e) => {
  navigator.clipboard.writeText(shareLink);
};

const tooltip = (
  <Tooltip id="confirm-copy">
    <strong>Link copied!</strong>
  </Tooltip>
);

const SettingsModal = ({
  isVisible,
  onCloseModal
}) => {

  return (
    <div>
      <Modal show={isVisible} onHide={onCloseModal}>
        <Modal.Header closeButton>
          <h2>Settings</h2>
        </Modal.Header>
        <Modal.Body>
          <hr />
          <h3>Invite to this Chat</h3>
          <p>
            Click to copy a link to your clipboard to invite others to this LeapChat room.
          </p>
          <OverlayTrigger placement="top" overlay={tooltip} trigger="click" delayHide={500}>
            <Button onClick={onCopyShareLink} bsStyle="primary" style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              Copy Link to Clipboard <div style={{width: '4px'}}></div><FaShareAlt />
            </Button>
          </OverlayTrigger>
          <hr />
          <h3>Feedback</h3>
          <p>
            Do you have feedback or suggestions on how we can improve LeapChat? We're listening!{' '}
            <a href="https://github.com/cryptag/leapchat/issues" target="_blank" rel="nofollow noreferrer noopener">
              Share your feedback here.{' '}<FaExternalLink size={19} />
            </a>
          </p>
          <hr />
          <h3 style={{ color: 'red' }}>Danger Zone</h3>
          <p>
            By clicking here, you will delete all messages in this chat from the server, for all users, forever.
          </p>
          <Button onClick={onDeleteAllMsgs} bsStyle="danger">
            Delete All Messages Forever
          </Button>

        </Modal.Body>
        <Modal.Footer>
          
        </Modal.Footer>
      </Modal>
    </div>
  );
};

SettingsModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onCloseModal: PropTypes.func.isRequired,

};

export default SettingsModal;