import React, { Component } from 'react';

class Message extends Component {
  render(){
    let { message, username } = this.props;
    let fromMe = message.from === username;
    let messageClass = fromMe ? 'chat-outgoing' : 'chat-incoming';
    
    return (
      <li className={messageClass} key={message.key}>
        <span className="username">{message.from}</span>
        {message.msg}
      </li>
    );
  }
}

export default Message;
