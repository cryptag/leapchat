import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

import Message from './Message';

class MessageList extends Component {

  render(){
    let { messages, username, onMessageDelete } = this.props;

    return (
      <ul>
        {messages.map( (message) => {
          return <Message
                    key={message.key}
                    message={message}
                    username={username}
                    onMessageDelete={onMessageDelete} />
        } )}
      </ul>
    );
  }
}

export default MessageList;
