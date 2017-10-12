import React, { Component } from 'react';

import MessageList from './MessageList';
import Throbber from '../general/Throbber';

import { playNotification } from '../../utils/audio';

class MessageBox extends Component {
  constructor(props){
    super(props);

    this.state = {
      notifiedIds: [],
      messagesEnd: null
    };
  }

  scrollToBottom = () => {
    playNotification();
    this.messagesEnd && this.messagesEnd.scrollIntoView();
  }

  // Separate function to set reference because of https://reactjs.org/docs/refs-and-the-dom.html#caveats
  setMessagesEndRef = (el) => {
    this.messagesEnd = el;
  }

  render(){
    let { messages, username } = this.props;

    return (
      <div className="message-box">
        <div className="message-list">
          <MessageList onNewMessages={this.scrollToBottom} messages={messages} username={username} />
        </div>
        <div style={{float: "left", clear: "both"}}
          ref={this.setMessagesEndRef}>
        </div>
      </div>
    )
  }
}

export default MessageBox;
