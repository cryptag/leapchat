import React from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

import MessageBox from './MessageBox';
import MessageForm from './MessageForm';
import AutoSuggest from './AutoSuggest';
import AlertContainer from '../general/AlertContainer';

const ChatContainer = ({ suggestions, messageInputFocus, onToggleModalVisibility }) => (
  <div className="content">
    <div className="chat-room-header">
      <span className="room-title">Room</span>
      <span className="room-badge">Encrypted</span>
    </div>

    <AlertContainer />

    <MessageBox />

    {suggestions.length > 0 && <AutoSuggest />}

    <MessageForm
      shouldHaveFocus={messageInputFocus}
      onToggleModalVisibility={onToggleModalVisibility} />
  </div>
);

ChatContainer.propTypes = {
  messageInputFocus: PropTypes.bool.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ suggestions: state.chat.suggestions });
export default connect(mapStateToProps)(ChatContainer);
