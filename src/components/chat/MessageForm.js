import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import FaArrowCircleRight from 'react-icons/lib/fa/arrow-circle-right';

class MessageForm extends Component {
  constructor(props) {
    super(props);

    this.onMessageUpdate = this.onMessageUpdate.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onSendMessage = this.onSendMessage.bind(this);
    this.clearMessage = this.clearMessage.bind(this);

    this.state = {
      message: ''
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

  render() {
    let { message } = this.state;

    return (
      <div className="message-form">
        <form role="form" className="form" onSubmit={this.onSendMessage}>
          <div>
            <Button onClick={this.onSendMessage}>
              <FaArrowCircleRight size={30} />
            </Button>

            <div className="message">
              <textarea
                className="form-control"
                onChange={this.onMessageUpdate}
                onKeyPress={this.onKeyPress}
                name="message"
                value={message}
                ref={(input) => { this.messageInput = input; }}
                placeholder="Enter message" required></textarea>
            </div>

          </div>
        </form>
      </div>
    );
  }
}

export default MessageForm;
