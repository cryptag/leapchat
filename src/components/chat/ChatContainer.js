import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

import MessageBox from './MessageBox';
import MessageForm from './MessageForm';
import AutoSuggest from './AutoSuggest';
import AlertContainer from '../general/AlertContainer';

const ChatContainer = ({
  suggestions,
  messageInputFocus,
  isAudioEnabled,
  onSetIsAudioEnabled,
  onToggleModalVisibility
}) => {

  return (
    <div className="content">

      <AlertContainer />

      <MessageBox
        isAudioEnabled={isAudioEnabled} />

      {suggestions.length > 0 && <AutoSuggest />}

      <MessageForm
        shouldHaveFocus={messageInputFocus}
        isAudioEnabled={isAudioEnabled}
        onSetIsAudioEnabled={onSetIsAudioEnabled}
        onToggleModalVisibility={onToggleModalVisibility} />

    </div>
  );
};

ChatContainer.propTypes = {
  messageInputFocus: PropTypes.bool.isRequired,
  isAudioEnabled: PropTypes.bool.isRequired,
  onSetIsAudioEnabled: PropTypes.func.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired,
};

const mapStateToProps = (reduxState) => {
  return {
    messages: reduxState.chat.messages,
    username: reduxState.chat.username,
    suggestions: reduxState.chat.suggestions,
  }
}

export default connect(mapStateToProps)(ChatContainer);
