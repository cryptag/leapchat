import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

import Message from './Message';

class MessageList extends Component {

  render(){
    let { messages, username, onDeleteMessage } = this.props;

    return (
      <ul>
        {messages.map( (message) => {
          return <Message
                    key={message.key}
                    message={message}
                    username={username}
                    onDeleteMessage={onDeleteMessage} />
        } )}
      </ul>
    );
  }
}

export default MessageList;
