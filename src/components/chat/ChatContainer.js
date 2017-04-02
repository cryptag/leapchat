import React, { Component } from 'react';

import MessageBox from './MessageBox';
import MessageForm from './MessageForm';

class ChatContainer extends Component {
  render(){
    let {messages, username, isLoadingMessages, onSendMessage, onDeleteMessage } = this.props;
    return (
      <div className="content">
        <MessageBox
          messages={messages}
          username={username}
          isLoadingMessages={isLoadingMessages}
          onDeleteMessage={onDeleteMessage}/>
        <MessageForm onSendMessage={onSendMessage} />
      </div>
    );
  }
}

export default ChatContainer;
