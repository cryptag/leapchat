import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import FaArrowCircleRight from 'react-icons/lib/fa/arrow-circle-right';
import FaSmileO from 'react-icons/lib/fa/smile-o';
import { Picker, emojiIndex } from 'emoji-mart';
import { connect } from 'react-redux'
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
  addSuggestion
} from '../../actions/chatActions';

class MessageForm extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.resolveFocus();
  }

  componentDidUpdate() {
    this.resolveFocus();
  }

  resolveFocus() {
    if (this.props.shouldHaveFocus) {
      this.messageInput.focus();
    }
  }

  onKeyPress = (e) => {
    const cursorIndex = this.messageInput.selectionStart;
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
  }

  onKeyDown = (e) => {
    const { message, suggestionWord, statuses } = this.props.chat;
    const cursorIndex = this.messageInput.selectionStart;
    const before = message.slice(0, cursorIndex - 1);
    const word = suggestionWord;
    const filterSuggestions = word[0] === '@'
      ? mentionSuggestions
      : emojiSuggestions;
    if (e.key === 'Backspace' && before.endsWith(word) && word) {
      const start = before.length - word.length;
      this.props.startSuggestions(start, filterSuggestions, statuses);
    }
  }

  isPayloadValid(message) {
    if (message && message.length > 0) {
      return true;
    }
    return false;
  }

  onSendMessage = (e) => {
    e.preventDefault();

    const { message } = this.props.chat;

    if (!this.isPayloadValid(message)) {
      return false;
    }

    this.props.onSendMessage(message);
    this.props.clearMessage();
  }

  backgroundImageFn = (set, sheetSize) => {
    if (set !== 'apple' || sheetSize !== 64) {
      console.log('WARNING: using set "apple" and sheetSize 64 rather than',
                  set, 'and', sheetSize, 'as was requested');
    }
    return '/' + emoji.EMOJI_APPLE_64_SHEET;
  }

  addEmoji = (emoji) => {
    const cursorIndex = this.messageInput.selectionStart;
    this.props.addEmoji(emoji.colons, cursorIndex);
  }

  handleKeyDown = (e) => {
    const { suggestions, suggestionStart } = this.props.chat;
    const cursorIndex = this.messageInput.selectionStart;
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
  }

  setMessageInput = (input) => {
    this.messageInput = input;
  }

  render() {
    const { message, showEmojiPicker } = this.props.chat;
    const { messageUpdate, togglePicker } = this.props;

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
              <FaSmileO size={24}
                className="emoji-picker-icon"
                onClick={togglePicker} />
            </div>

            <div className="message" onKeyDown={this.handleKeyDown}>
              <textarea
                className="form-control"
                onChange={this.props.messageUpdate}
                onKeyPress={this.onKeyPress}
                onKeyDown={this.onKeyDown}
                name="message"
                value={message}
                ref={this.setMessageInput}
                placeholder="Enter message">
              </textarea>
              <Button onClick={this.onSendMessage}>
                <FaArrowCircleRight size={30} />
              </Button>
            </div>
          </div>

        </form>
      </div>
    );
  }
}

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
  addSuggestion
})(MessageForm);
