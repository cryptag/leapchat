import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import FaArrowCircleRight from 'react-icons/lib/fa/arrow-circle-right';
import FaSmileO from 'react-icons/lib/fa/smile-o';
import { Picker, emojiIndex } from 'emoji-mart';
import { connect } from 'react-redux'
import emoji from '../../constants/emoji';
import { messageUpdate, clearMessage, togglePicker, addEmoji, closePicker, emojiSuggestions, showSuggestions } from '../../actions/chatActions';

const searchEmojis = emojiIndex.search

console.log(searchEmojis, 'search')
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
    const suggestionStart = this.props.chat.suggestionStart
    // Send on <enter> unless <shift-enter> has been pressed
    if (e.key === 'Enter' && !e.nativeEvent.shiftKey) {
      this.onSendMessage(e);
      this.props.closePicker();
    }
    if (e.key === ':' && !this.props.chat.suggestionStart) {
      this.props.emojiSuggestions(cursorIndex);
      this.props.showSuggestions(suggestionStart,this.props.chat.message);
    }
    if(this.props.chat.suggestionStart) {
      this.props.showSuggestions(suggestionStart,this.props.chat.message);
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

            <div className="message">
              <textarea
                className="form-control"
                onChange={this.props.messageUpdate}
                onKeyPress={this.onKeyPress}
                name="message"
                value={message}
                ref={(input) => { this.messageInput = input; }}
                placeholder="Enter message" required>
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

export default connect(({chat}) => ({chat}), { messageUpdate, clearMessage, togglePicker, addEmoji, closePicker, emojiSuggestions, showSuggestions } )(MessageForm);
