import React, { Component } from 'react';

import MessageBox from './MessageBox';
import MessageForm from './MessageForm';
import AlertContainer from '../general/AlertContainer';

class ChatContainer extends Component {
  render(){
    let { messages, username, onSendMessage } = this.props;
    let { alertMessage, alertStyle, onAlertDismiss } = this.props;

    return (
      <div className="content">

        <AlertContainer
            message={alertMessage}
            alertStyle={alertStyle}
            onAlertDismiss={onAlertDismiss} />

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
