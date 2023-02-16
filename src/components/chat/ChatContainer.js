import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

import MessageBox from './MessageBox';
import MessageForm from './MessageForm';
import AlertContainer from '../general/AlertContainer';
import AutoSuggest from './AutoSuggest';

class ChatContainer extends Component {
  render() {
    const {
      messages,
      username,
      onSendMessage,
      alertMessage,
      alertStyle,
      onAlertDismiss,
      messageInputFocus,
      chat,
      isAudioEnabled,
      onSetIsAudioEnabled } = this.props;

    return (
      <div className="content">

        <AlertContainer
          message={alertMessage}
          alertStyle={alertStyle}
          onAlertDismiss={onAlertDismiss} />

        <MessageBox
          messages={messages}
          username={username} 
          isAudioEnabled={isAudioEnabled} />

        {chat.suggestions.length > 0 && <AutoSuggest />}

        <MessageForm
          onSendMessage={onSendMessage}
          shouldHaveFocus={messageInputFocus}
          isAudioEnabled={isAudioEnabled}
          onSetIsAudioEnabled={onSetIsAudioEnabled} />

      </div>
    );
  }
}

ChatContainer.propTypes = {
  messages: PropTypes.array.isRequired,
  username: PropTypes.string.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  alertMessage: PropTypes.string,
  alertStyle: PropTypes.string,
  onAlertDismiss: PropTypes.func,
  messageInputFocus: PropTypes.bool.isRequired,
  chat: PropTypes.object.isRequired,
  isAudioEnabled: PropTypes.bool.isRequired,
  onSetIsAudioEnabled: PropTypes.func.isRequired,
};

export default connect(({ chat }) => ({ chat }))(ChatContainer);
