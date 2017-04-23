import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';

class Message extends Component {
  render(){
    let { message, username } = this.props;
    let fromMe = message.from === username;
    let messageClass = fromMe ? 'chat-outgoing' : 'chat-incoming';
    
    return (
      <li className={messageClass} key={message.key}>
        <span className="username">{message.from}</span>
        <ReactMarkdown source={message.msg} escapeHtml={true} />
      </li>
    );
  }
}

export default Message;
