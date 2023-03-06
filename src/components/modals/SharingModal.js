import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';

import { Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaShareAlt } from 'react-icons/fa';
import { FaShareAltSquare } from 'react-icons/fa';

import { FaQrcode } from 'react-icons/fa';

import QRCode from "react-qr-code";


const getWindowLocationHref = () => {
  if (Capacitor.isNativePlatform()) {
    return 'https://' + window.location.href.split('//')[1];  // http -> https
  } else {
    return window.location.href;
  }
};

const onCopyShareLink = async (e) => {
  if (Capacitor.isNativePlatform()) {
    await Clipboard.write({ string: getWindowLocationHref() });
  } else {
    navigator.clipboard.writeText( getWindowLocationHref() );
  }
};

const onShareLink = (e) => {
  navigator.share({
    url: getWindowLocationHref(),
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

  const [showQRCode, setShowQRCode] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  const onGenerateQRCode = () => {
    setShowQRCode(true);
    setInviteLink(getWindowLocationHref());
  };

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
            <input className="form-control current-href" type="text" readOnly value={getWindowLocationHref()} />
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
          <hr />
          <h3>QR Code</h3>
          <Button className="icon-button" variant="primary" onClick={onGenerateQRCode}>
            Generate QR Code
            <FaQrcode size={15} />
          </Button>
          <div className="qr-code">
            {showQRCode && <QRCode value={inviteLink} />}
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