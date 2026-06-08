import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { FiShare2, FiCopy, FiLink } from 'react-icons/fi';

const SharingModal = ({ isVisible, onClose }) => {
  const onCopy = () => navigator.clipboard.writeText(window.location.href);
  const onShare = () => navigator.share({ url: window.location.href, title: 'LeapChat', text: 'Join me on LeapChat' });

  return (
    <Modal size="lg" show={isVisible} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Invite People</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {navigator.share && (
          <div className="settings-section">
            <h3>Share</h3>
            <p>Invite via SMS, email, or other apps.</p>
            <Button className="icon-button" onClick={onShare} variant="primary" size="sm">
              <FiShare2 size={14} /> Share Link
            </Button>
          </div>
        )}

        <div className="settings-section">
          <h3>Copy Link</h3>
          <p>Share this link with anyone you want to invite.</p>
          <div className="share-copy-link">
            <input
              className="form-control"
              type="text"
              readOnly
              value={window.location.href}
              onClick={(e) => e.target.select()} />
            <Button className="icon-button" variant="primary" size="sm" onClick={onCopy}>
              <FiCopy size={14} /> Copy
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

SharingModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SharingModal;
