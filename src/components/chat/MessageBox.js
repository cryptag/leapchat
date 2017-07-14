import React, { Component } from 'react';

import MessageList from './MessageList';
import Throbber from '../general/Throbber';

import { playNotification } from '../../utils/audio';

class MessageBox extends Component {
  constructor(props){
    super(props);

    this.state = {
      notifiedIds: [],
      messagesEnd: null
    };
  }
  componentDidUpdate(prevProps){
    if (this.shouldScroll(prevProps)){
      this.scrollToBottom();
    }
  }

  shouldScroll(prevProps){
    let hasNewMessages = this.hasNewMessages(prevProps);
    if (hasNewMessages){
      this.checkNewMessages(prevProps.messages);
    }
    return hasNewMessages;
  }

  checkNewMessages(prevMessages){
    let messageIds = prevMessages.map( (message) => {
      return message.key;
    });
    messageIds = messageIds.concat(this.state.notifiedIds);

    let newMessages = this.props.messages.filter((message) => {
      return messageIds.indexOf(message.key) === -1;
    });

    // better logic needed, but this will play a notification if you've been mentioned.
    let newMessageIds = [];
    let iWasMentioned = false;
    let newMessageFromNotMe = false;
    newMessages.forEach( (message) => {
      newMessageIds.push(message.key);
      let content = message.msg.toLowerCase();
      let username = this.props.username.toLowerCase();
      if (content.indexOf('@' + username) > -1){
        iWasMentioned = true;
      }
      if (message.from !== this.props.username){
        newMessageFromNotMe = true
      }
    });

    if (newMessageFromNotMe){
      playNotification();
    }
    if (iWasMentioned){
      // TODO: Display dialog box with this data:
      // {'title': message.from, 'message': message.msg}
    }

    let notifiedIds = this.state.notifiedIds;
    this.setState({
      notifiedIds: notifiedIds.concat(newMessageIds)
    });
  }

  hasNewMessages(prevProps){
    return prevProps.messages.length !== this.props.messages.length;
  }

  scrollToBottom(){
    this.messagesEnd.scrollIntoView({behavior: "smooth"});
  }

  render(){
    let { messages, username } = this.props;

    return (
      <div className="message-box">
        <div className="message-list">
          <MessageList messages={messages} username={username} />
        </div>
        <div style={{float: "left", clear: "both"}}
          ref={(el) => { this.messagesEnd = el }}>
        </div>
      </div>
    )
  }
}

export default MessageBox;
