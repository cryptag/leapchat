import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

import { Button } from 'react-bootstrap';
import { FaArrowAltCircleRight } from 'react-icons/fa';
import { FaSmile } from 'react-icons/fa';
import { Picker } from 'emoji-mart';

import emoji from '../../constants/emoji';
import { emojiSuggestions, mentionSuggestions } from '../../utils/suggestions';
import {
  messageUpdate,
  clearMessage,
  togglePicker,
  addEmoji,
  closePicker,
  startSuggestions,
  stopSuggestions,
  downSuggestion,
  upSuggestion,
  addSuggestion,
  sendMessage,
} from '../../store/actions/chatActions';

import ToggleAudioIcon from './toolbar/ToggleAudioIcon';
import InviteIcon from './toolbar/InviteIcon';
import OpenSearchIcon from './toolbar/OpenSearchIcon';

class MessageForm extends Component {
  constructor(props) {
    super(props);

    this.messageInput = React.createRef();
  }

  componentDidMount() {
    this.resolveFocus();
  }

  componentDidUpdate() {
    this.resolveFocus();
  }

  resolveFocus() {
    if (this.props.shouldHaveFocus) {
      this.messageInput.current.focus();
    }
  }

  onKeyPress = (e) => {
    const cursorIndex = this.messageInput.current.selectionStart;
    const { suggestionStart, suggestions, highlightedSuggestion, statuses} = this.props.chat;
    // Send on <enter> unless <shift-enter> has been pressed
    if (e.key === 'Enter' && !e.nativeEvent.shiftKey) {
      if (suggestions.length > 0) {
        const selected = suggestions[highlightedSuggestion];
        e.preventDefault();
        return this.props.addSuggestion(selected.name);
      }
      this.onSendMessage(e);
      this.props.closePicker();
    }
    if (e.key === ':' && suggestionStart === null) {
      this.props.startSuggestions(cursorIndex, emojiSuggestions);
    }
    if (e.key === '@' && suggestionStart === null) {
      this.props.startSuggestions(cursorIndex, mentionSuggestions, statuses);
    }
    if(e.nativeEvent.code === 'Space' && suggestionStart !== null) {
      this.props.stopSuggestions();
    }
  };

  onKeyDown = (e) => {
    const { message, suggestionWord, statuses } = this.props.chat;
    const cursorIndex = this.messageInput.current.selectionStart;
    const before = message.slice(0, cursorIndex - 1);
    const word = suggestionWord;
    const filterSuggestions = word[0] === '@'
      ? mentionSuggestions
      : emojiSuggestions;
    if (e.key === 'Backspace' && before.endsWith(word) && word) {
      const start = before.length - word.length;
      this.props.startSuggestions(start, filterSuggestions, statuses);
    }
  };

  isPayloadValid(message) {
    if (message && message.length > 0) {
      return true;
    }
    return false;
  }

  onSendMessage = (e) => {
    e.preventDefault();

    const { message, username } = this.props.chat;

    if (!this.isPayloadValid(message)) {
      return false;
    }

    this.props.sendMessage({ message, username });
    this.props.clearMessage();
  };

  backgroundImageFn = (set, sheetSize) => {
    if (set !== 'apple' || sheetSize !== 64) {
      console.log('WARNING: using set "apple" and sheetSize 64 rather than',
        set, 'and', sheetSize, 'as was requested');
    }
    return '/' + emoji.EMOJI_APPLE_64_SHEET;
  };

  addEmoji = (emoji) => {
    const cursorIndex = this.messageInput.current.selectionStart;
    this.props.addEmoji(emoji.colons, cursorIndex);
  };

  handleKeyDown = (e) => {
    const { suggestions, suggestionStart } = this.props.chat;
    const cursorIndex = this.messageInput.current.selectionStart;
    if (e.key === 'Backspace' && cursorIndex - suggestionStart === 1) {
      this.props.stopSuggestions();
    }
    if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault();
      this.props.upSuggestion();
    }
    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      this.props.downSuggestion();
    }
  };

  render() {
    const {
      message,
      showEmojiPicker,
      username,
      messages,
    } = this.props.chat;

    const {
      togglePicker,
      isAudioEnabled,
      onSetIsAudioEnabled } = this.props;

    return (
      <div className="message-form">
        <form role="form" className="form" onSubmit={this.onSendMessage}>
          {showEmojiPicker && <Picker
            emojiSize={24}
            perLine={9}
            skin={1}
            set={'apple'}
            autoFocus={false}
            include={[]}
            exclude={['nature', 'places', 'flags']}
            emoji={""}
            title={"LeapChat"}
            backgroundImageFn={this.backgroundImageFn}
            onClick={this.addEmoji} />}

          <div>
            <div className="chat-icons">
              <FaSmile size={24}
                className="emoji-picker-icon"
                onClick={togglePicker} />

              <ToggleAudioIcon
                isAudioEnabled={isAudioEnabled}
                onSetIsAudioEnabled={onSetIsAudioEnabled} />

              <OpenSearchIcon
                username={username}
                messages={messages} />

              <InviteIcon />

              <div className="right-chat-icons"></div>
            </div>

            
            <div className="message" onKeyDown={this.handleKeyDown}>
              <textarea
                className="form-control"
                onChange={this.props.messageUpdate}
                onKeyPress={this.onKeyPress}
                onKeyDown={this.onKeyDown}
                name="message"
                value={message}
                ref={this.messageInput}
                placeholder="Enter message">
              </textarea>
              <Button onClick={this.onSendMessage}>
                <FaArrowAltCircleRight size={30} />
              </Button>
            </div>

          </div>
        </form>

      </div>
    );
  }
}

MessageForm.propType = {
  shouldHaveFocus: PropTypes.bool.isRequired,
  onSetIsAudioEnabled: PropTypes.func.isRequired,
  isAudioEnabled: PropTypes.bool.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired,
};

export default connect(({ chat }) => ({chat}), {
  messageUpdate,
  clearMessage,
  togglePicker,
  addEmoji,
  closePicker,
  startSuggestions,
  stopSuggestions,
  downSuggestion,
  upSuggestion,
  addSuggestion,
  sendMessage,
})(MessageForm);
