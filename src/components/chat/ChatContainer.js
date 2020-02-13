import React, { Component } from 'react';
import { connect } from 'react-redux';

import MessageBox from './MessageBox';
import MessageForm from './MessageForm';
import AlertContainer from '../general/AlertContainer';
import AutoSuggest from './AutoSuggest';

class ChatContainer extends Component {
  render() {
    const { messages, username, onSendMessage, alertMessage, alertStyle, onAlertDismiss, chat } = this.props;

    return (
      <div className="content">

        <AlertContainer
          message={alertMessage}
          alertStyle={alertStyle}
          onAlertDismiss={onAlertDismiss} />

        <MessageBox
          messages={messages}
          username={username} />

        {chat.suggestions.length > 0 && <AutoSuggest />}

        <MessageForm
          onSendMessage={onSendMessage}
          shouldHaveFocus={this.props.messageInputFocus} />

      </div>
    );
  }
}

export default connect(({ chat }) => ({ chat }))(ChatContainer);
