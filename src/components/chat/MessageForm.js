import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import FaArrowCircleRight from 'react-icons/lib/fa/arrow-circle-right';
import FaSmileO from 'react-icons/lib/fa/smile-o';
import { Picker } from 'emoji-mart';

class MessageForm extends Component {
  constructor(props) {
    super(props);

    this.onMessageUpdate = this.onMessageUpdate.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onSendMessage = this.onSendMessage.bind(this);
    this.clearMessage = this.clearMessage.bind(this);

    this.state = {
      message: '',
      emojiPicker: false
    }
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

  onMessageUpdate(e) {
    this.setState({
      message: e.target.value
    });
  }

  onKeyPress(e) {
    // Send on <enter> unless <shift-enter> has been pressed
    if (e.key === 'Enter' && !e.nativeEvent.shiftKey) {
      this.onSendMessage(e);
      this.closePicker();
    }
  }

  isPayloadValid(message) {
    if (message && message.length > 0) {
      return true;
    }
    return false;
  }

  clearMessage() {
    this.setState({
      message: ''
    });
  }

  onSendMessage(e) {
    e.preventDefault();

    let { message } = this.state;

    if (!this.isPayloadValid(message)) {
      return false;
    }

    this.props.onSendMessage(message);
    this.clearMessage();
  }
  togglePicker = () => {
    this.setState((prevState) => {
      return {emojiPicker: !prevState.emojiPicker}
    })
  }
  closePicker = () => {
    this.setState({
      emojiPicker: false
    })
  }
  addEmoji = (emoji) => {
    this.setState((prevState) => {
      return {message: prevState.message.concat(`${emoji.colons} `)}
    })
  }
  render() {
    let { message, emojiPicker } = this.state;

    return (
      <div className="message-form">
        <form role="form" className="form" onSubmit={this.onSendMessage}>
          {emojiPicker && <Picker emojiSize={24} perLine={9} skin={1} set={'apple'} autoFocus={false} include={[]} exclude={['nature', 'places', 'flags']} emoji={""} title={"LeapChat"} onClick={(emoji, event) => {this.addEmoji(emoji); this.closePicker()}}/>}
          <div>

            <div className="chat-icons">
              <FaSmileO size={24} className="emoji-picker-icon" onClick={this.togglePicker}/>
            </div>
            <div className="message">
              <textarea
                className="form-control"
                onChange={this.onMessageUpdate}
                onKeyPress={this.onKeyPress}
                name="message"
                value={message}
                ref={(input) => { this.messageInput = input; }}
                placeholder="Enter message" required></textarea>
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

export default MessageForm;
