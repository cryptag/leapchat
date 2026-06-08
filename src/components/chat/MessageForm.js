import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { FiSmile, FiVolume2, FiVolumeX, FiSearch, FiUserPlus, FiSend } from 'react-icons/fi';
import { Picker } from 'emoji-mart';

import emoji from '../../constants/emoji';
import { emojiSuggestions, mentionSuggestions } from '../../utils/suggestions';
import {
  messageUpdate, clearMessage, togglePicker, addEmoji, closePicker,
  startSuggestions, stopSuggestions, downSuggestion, upSuggestion,
  addSuggestion, sendMessage,
} from '../../store/actions/chatActions';
import { enableAudio, disableAudio } from '../../store/actions/settingsActions';

import OpenSearchIcon from './toolbar/OpenSearchIcon';
import InviteIcon from './toolbar/InviteIcon';

class MessageForm extends Component {
  constructor(props) {
    super(props);
    this.messageInput = React.createRef();
  }

  componentDidMount() { this.resolveFocus(); }
  componentDidUpdate() { this.resolveFocus(); }

  resolveFocus() {
    if (this.props.shouldHaveFocus && this.messageInput.current) {
      this.messageInput.current.focus();
    }
  }

  onKeyPress = (e) => {
    const cursorIndex = this.messageInput.current.selectionStart;
    const { suggestionStart, suggestions, highlightedSuggestion, statuses } = this.props;
    if (e.key === 'Enter' && !e.nativeEvent.shiftKey) {
      if (suggestions.length > 0) {
        e.preventDefault();
        return this.props.addSuggestion(suggestions[highlightedSuggestion].name);
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
    if (e.nativeEvent.code === 'Space' && suggestionStart !== null) {
      this.props.stopSuggestions();
    }
  };

  onKeyDown = (e) => {
    const { message, suggestionWord, statuses, suggestions, suggestionStart } = this.props;
    const cursorIndex = this.messageInput.current.selectionStart;
    const before = message.slice(0, cursorIndex - 1);
    const word = suggestionWord;
    const filterSuggestions = word[0] === '@' ? mentionSuggestions : emojiSuggestions;

    if (e.key === 'Backspace' && before.endsWith(word) && word) {
      this.props.startSuggestions(before.length - word.length, filterSuggestions, statuses);
    }
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

  onSendMessage = (e) => {
    e.preventDefault();
    const { message, username } = this.props;
    if (!message || message.length === 0) return;
    this.props.sendMessage({ message, username });
    this.props.clearMessage();
  };

  backgroundImageFn = () => '/' + emoji.EMOJI_APPLE_64_SHEET;

  addEmoji = (em) => {
    const cursorIndex = this.messageInput.current.selectionStart;
    this.props.addEmoji(em.colons, cursorIndex);
  };

  render() {
    const {
      message, showEmojiPicker, username, messages,
      togglePicker, isAudioEnabled, enableAudio, disableAudio,
    } = this.props;

    return (
      <div className="message-form" style={{ position: 'relative' }}>
        {showEmojiPicker && (
          <div className="emoji-picker-wrap">
            <Picker
              emojiSize={22}
              perLine={9}
              skin={1}
              set="apple"
              autoFocus={false}
              include={[]}
              exclude={['nature', 'places', 'flags']}
              emoji=""
              title="LeapChat"
              backgroundImageFn={this.backgroundImageFn}
              onClick={this.addEmoji} />
          </div>
        )}

        <div className="chat-toolbar">
          <button className="chat-tool-btn" onClick={togglePicker} title="Emoji">
            <FiSmile size={18} />
          </button>
          <button
            className="chat-tool-btn"
            title={isAudioEnabled ? 'Mute notifications' : 'Enable notifications'}
            onClick={() => isAudioEnabled ? disableAudio() : enableAudio()}>
            {isAudioEnabled ? <FiVolume2 size={18} /> : <FiVolumeX size={18} />}
          </button>
          <OpenSearchIcon username={username} messages={messages} />
          <InviteIcon />
        </div>

        <form onSubmit={this.onSendMessage}>
          <div className="message-input-row">
            <textarea
              className="message-textarea"
              onChange={(e) => this.props.messageUpdate(e.target.value)}
              onKeyPress={this.onKeyPress}
              onKeyDown={this.onKeyDown}
              name="message"
              value={message}
              ref={this.messageInput}
              placeholder="Send a message…"
              rows={1} />
            <button type="submit" className="send-btn" title="Send">
              <FiSend size={15} />
            </button>
          </div>
        </form>
      </div>
    );
  }
}

MessageForm.propTypes = {
  shouldHaveFocus: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  isAudioEnabled: state.settings.isAudioEnabled,
  ...state.chat,
});

export default connect(mapStateToProps, {
  messageUpdate, clearMessage, togglePicker, addEmoji, closePicker,
  startSuggestions, stopSuggestions, downSuggestion, upSuggestion,
  addSuggestion, sendMessage, enableAudio, disableAudio,
})(MessageForm);
