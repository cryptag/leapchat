import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

import Message from './Message';

class MessageList extends Component {

  render(){
    let { messages, username } = this.props;

    return (
      <ul>
        {messages.map( (message) => {
          return <Message
                    key={message.key}
                    message={message}
                    username={username} />
        } )}
      </ul>
    );
  }
}

export default MessageList;
