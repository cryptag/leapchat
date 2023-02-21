import React, { Component } from 'react';

import MessageList from './MessageList';
import { connect } from 'react-redux';
import { closePicker } from '../../actions/chatActions';
import { playNotification } from '../../utils/audio';

class MessageBox extends Component {
  constructor(props){
    super(props);

    this.state = {
      notifiedIds: [],
      messagesEnd: null
    };
  }

  onNewMessages = () => {
    if (this.props.isAudioEnabled){
      playNotification();
    }
    this.scrollToBottom();
  };

  scrollToBottom = () => {
    this.messagesEnd && this.messagesEnd.scrollIntoView();
  };

  // Separate function to set reference because of https://reactjs.org/docs/refs-and-the-dom.html#caveats
  setMessagesEndRef = (el) => {
    this.messagesEnd = el;
  };

  render(){
    let { messages, username, closePicker } = this.props;

    return (
      <div className="message-box" onClick={closePicker}>
        <div className="message-list">
          <MessageList
            onNewMessages={() => this.onNewMessages()}
            messages={messages}
            username={username} />
        </div>
        <div style={{float: "left", clear: "both"}}
          ref={this.setMessagesEndRef}>
        </div>
      </div>
    );
  }
}

export default connect(null, { closePicker })(MessageBox);
