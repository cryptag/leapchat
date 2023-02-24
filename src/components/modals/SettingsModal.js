import React from 'react';
import PropTypes from 'prop-types';

import { Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaExternalLinkAlt } from 'react-icons/fa';

import { chatHandler } from '../../store/epics/chatEpics';

const onDeleteAllMsgs = (e) => {
  if (window.confirm("Are you sure you want to delete every existing chat message from this chat room? This action cannot be undone.")) {
    chatHandler.sendDeleteAllMessagesSignalToServer();
  }
};

const SettingsModal = ({
  isVisible,
  onClose
}) => {

  return (
    <div>
      <Modal show={isVisible} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Feedback</h3>
          <p>
            Do you have feedback or suggestions on how we can improve LeapChat? We're listening!{' '}
            <a href="https://github.com/cryptag/leapchat/issues" target="_blank" rel="nofollow noreferrer noopener">
              Share your feedback here.{' '}<FaExternalLinkAlt size={15} />
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
  onClose: PropTypes.func.isRequired,

};

export default SettingsModal;