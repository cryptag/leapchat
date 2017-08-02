import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';

export default class InfoModal extends Component {
  constructor(props){
    super(props)
  }

  render() {
    return (
      <Modal show={this.props.showModal} onHide={this.props.toggleInfoModal}>
        <Modal.Header closeButton>
          <h3>Welcome to LeapChat!</h3>
          <h4>LeapChat: encrypted, ephemeral, in-browser chat.</h4>
        </Modal.Header>
        <Modal.Body>
          <p>Just visit <a href="https://www.leapchat.org/" target="_blank">leapchat.org</a> and a new, secure chat room will instantly be created for you. And once you're in, just link people to that page to invite them to join you!</p>
        <h3>
          Why LeapChat?
        </h3>
          <p>
            You shouldn't have to sacrifice your privacy and personal information just to chat online. Slack, HipChat, and others make you create an account with your email address, their software doesn't encrypt your messages (they can see everything), and the messages last forever unless you manually delete them.
            In contrast, LeapChat <em>does</em> encrypt your messages (even we can't see them!), <em>doesn't</em> require you to hand over your email address, and messages last for a maximum of 90 days (this will soon be configurable to a shorter duration).
            Plus, you can host LeapChat on your own server, since it's <a href="https://github.com/cryptag/leapchat" target="_blank">open source</a>!
          </p>
          <h3>
            How does it work?
          </h3>
          <p>
            When click on a link to a LeapChat room:
            <ol>
              <li>
                Your browser loads the HTML, CSS, and JavaScript from the server (e.g., leapchat.org)
              </li>
              <li>
                That JavaScript code then grabs the long passphrase at the end of the URL (the "URL hash" -- everything after the `#`), then passes it to <a href="https://github.com/kaepora/minilock" target="_blank">miniLock</a>, which then deterministically generates a keypair from that passphrase
              </li>
              <li>
                That cryptographic keypair is then used by your browser (and every other chat participant) to encrypt and decrypt messages to and from the people you're chatting with
              </li>
            </ol>
            The server can't even see your username!  That's encrypted, too, and is attached to the messages you send.
          </p>
          <h3>
            Can I type markdown in my messages?
          </h3>
          <p>
            <em>Yup!</em> To learn about Markdown syntax, like surrounding words with **double asterisks** to make them <b>bold</b>, or with _underscores_ to make them <i>italicized</i>, <a href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet" target="_blank">check out this guide</a>.
          </p>
        </Modal.Body>
      </Modal>
    );
  }
}
