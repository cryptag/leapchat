import React from 'react';
import PropTypes from 'prop-types';

import { Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaShareAlt } from 'react-icons/fa';
import { FaShareAltSquare } from 'react-icons/fa';

const onCopyShareLink = (e) => {
  navigator.clipboard.writeText(window.location.href);
};

const onShareLink = (e) => {
  navigator.share({
    url: window.location.href,
    title: "LeapChat",
    text: "Join me on LeapChat"
  });
};

const copyLinkTooltip = (
  <Tooltip id="confirm-copy">
    <strong>Link copied!</strong>
  </Tooltip>
);

const SharingModal = ({
  isVisible,
  onClose
}) => {
  return (
    <div>
      <Modal size="lg" show={isVisible} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Invite to Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { navigator.share && <div>
            <h3>Share Link</h3>
            <p>
              Invite with a link shared via SMS, Email, etc.
            </p>
            <Button className="icon-button" onClick={onShareLink} variant="primary">
              Share Link <FaShareAltSquare />
            </Button>
            <hr />
          </div>
          }

          <h3>Copy Link</h3>
          <p>Invite with a link copied to your clipboard.</p>
          <div className="input-group share-copy-link">
            <input className="form-control current-href" type="text" readOnly value={window.location.href} />
            <OverlayTrigger
              trigger="click"
              overlay={copyLinkTooltip}
              placement="top"
              delay={{ show: 300, hide: 150 }}>
              <Button className="icon-button" variant="primary" onClick={onCopyShareLink}>
                Copy to Clipboard
                <FaShareAlt size={15} />
              </Button>
            </OverlayTrigger>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

SharingModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

};

export default SharingModal;