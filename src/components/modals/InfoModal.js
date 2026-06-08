import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

const InfoModal = ({ isVisible, onClose }) => (
  <Modal size="lg" show={isVisible} onHide={onClose} centered>
    <Modal.Header closeButton>
      <Modal.Title>About LeapChat</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <h4>Encrypted, ephemeral, in-browser chat.</h4>
      <p>
        Visit <a href="https://www.leapchat.org/" target="_blank" rel="nofollow noreferrer noopener">leapchat.org</a> and
        a new secure room is instantly created. Share the URL to invite others — no accounts needed.
      </p>

      <h3>Why LeapChat?</h3>
      <p>
        Your messages are end-to-end encrypted — even the server can't read them.
        No email required. Messages expire after 90 days.
        Fully <a href="https://github.com/cryptag/leapchat" target="_blank" rel="nofollow noreferrer noopener">open source</a>.
      </p>

      <h3>How it works</h3>
      <ol>
        <li>Your browser loads the app from the server.</li>
        <li>
          The passphrase in the URL hash is passed to{' '}
          <a href="https://web.archive.org/web/20180508023310/https://minilock.io/" target="_blank" rel="nofollow noreferrer noopener">miniLock</a>
          , which generates a cryptographic keypair.
        </li>
        <li>That keypair encrypts and decrypts all messages — the server never sees plaintext.</li>
      </ol>

      <h3>Markdown support</h3>
      <p>
        Type <code>**bold**</code>, <code>_italic_</code>, or{' '}
        <a href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet" target="_blank" rel="nofollow noreferrer noopener">
          any Markdown syntax
        </a>{' '}in your messages.
      </p>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" onClick={onClose}>Got it</Button>
    </Modal.Footer>
  </Modal>
);

InfoModal.propTypes = { onClose: PropTypes.func.isRequired };
export default InfoModal;
