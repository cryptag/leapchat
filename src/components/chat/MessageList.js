import React, { Component } from 'react';
import Message from './Message';

class MessageList extends Component {
  componentDidUpdate() {
    this.props.onNewMessages();
  }

  render() {
    const { messages, username } = this.props;

    return (
      <div className="message-list">
        {messages.map((message, i) => {
          const isGroupStart = i === 0 || messages[i - 1].from !== message.from;
          return (
            <Message
              key={message.key || i}
              message={message}
              username={username}
              isGroupStart={isGroupStart} />
          );
        })}
      </div>
    );
  }
}

export default MessageList;
