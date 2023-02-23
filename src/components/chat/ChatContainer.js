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
  onToggleModalVisibility
}) => {

  return (
    <div className="content">

      <AlertContainer />

      <MessageBox />

      {suggestions.length > 0 && <AutoSuggest />}

      <MessageForm
        shouldHaveFocus={messageInputFocus}
        onToggleModalVisibility={onToggleModalVisibility} />

    </div>
  );
};

ChatContainer.propTypes = {
  messageInputFocus: PropTypes.bool.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired,
};

const mapStateToProps = (reduxState) => {
  return {
    suggestions: reduxState.chat.suggestions,
  };
};

export default connect(mapStateToProps)(ChatContainer);
