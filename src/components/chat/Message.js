import React, { Component } from 'react';

import DeleteMessageButton from './DeleteMessageButton';

class Message extends Component {
  render(){
    let { message, username, onDeleteMessage } = this.props;
    let fromMe = message.from === username;
    let messageClass = fromMe ? 'chat-outgoing' : 'chat-incoming';
    
    return (
      <li className={messageClass} key={message.key}>
        {fromMe && <DeleteMessageButton onDeleteMessage={onDeleteMessage} message={message} />}
        <span className="username">{message.from}</span>
        {message.msg}
      </li>
    );
  }
}

export default Message;
