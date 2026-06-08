import React, { Component } from 'react';
import { connect } from 'react-redux';
import { closePicker } from '../../store/actions/chatActions';
import { playNotification } from '../../utils/audio';
import MessageList from './MessageList';

class MessageBox extends Component {
  constructor(props) {
    super(props);
    this.messagesEnd = null;
  }

  onNewMessages = () => {
    if (this.props.isAudioEnabled) {
      playNotification();
    }
    this.scrollToBottom();
  };

  scrollToBottom = () => {
    this.messagesEnd && this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
  };

  setMessagesEndRef = (el) => { this.messagesEnd = el; };

  render() {
    const { messages, username, closePicker } = this.props;

    return (
      <div className="message-box" onClick={closePicker}>
        <MessageList
          onNewMessages={this.onNewMessages}
          messages={messages}
          username={username} />
        <div ref={this.setMessagesEndRef} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  messages:       state.chat.messages,
  username:       state.chat.username,
  isAudioEnabled: state.settings.isAudioEnabled,
});

export default connect(mapStateToProps, { closePicker })(MessageBox);
