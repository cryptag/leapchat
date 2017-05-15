import React, { Component } from 'react';

import MessageBox from './MessageBox';
import MessageForm from './MessageForm';

class ChatContainer extends Component {
  render(){
    let { messages, username, onSendMessage } = this.props;

    return (
      <div className="content">
        <MessageBox
          messages={messages}
          username={username} />

        <MessageForm
          onSendMessage={onSendMessage} />

      </div>
    );
  }
}

export default ChatContainer;
