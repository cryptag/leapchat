import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

import Message from './Message';

class MessageList extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.messages.length > 0 
      && nextProps.messages
        .map(m => m.id)
        .concat(this.props.messages.map(m => m.id))
        .reduce((acc, id) => {
          if(!acc.indexOf(id) === -1){
            acc.push(id)
          }
          return acc;
        }, [])
        .length !== this.props.messages;
  }

  componentDidUpdate(){
    this.props.onNewMessages();
  }

  render() {
    const { messages, username } = this.props;

    return (
      <ul>
        {messages.map((message, i) => {
          return <Message
            key={i}
            message={message}
            username={username} />
        })}
      </ul>
    );
  }
}

export default MessageList;
