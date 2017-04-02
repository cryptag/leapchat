import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import notifier from 'node-notifier';

import MessageList from './MessageList';
import Throbber from '../general/Throbber';

import { playNotification } from '../../utils/audio';

class MessageBox extends Component {
  constructor(props){
    super(props);

    this.state = {
      notifiedIds: []
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
    return prevProps.isLoadingMessages !== this.props.isLoadingMessages || hasNewMessages;
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
    newMessages.forEach( (message) => {
      newMessageIds.push(message.key);
      let content = message.msg.toLowerCase();
      let username = this.props.username.toLowerCase();
      if (content.indexOf('@' + username) > -1){
        notifier.notify({
          'title': message.from,
          'message': message.msg
        });
        playNotification();
      }
    });

    let notifiedIds = this.state.notifiedIds;
    this.setState({
      notifiedIds: notifiedIds.concat(newMessageIds)
    });
  }

  hasNewMessages(prevProps){
    return prevProps.messages.length !== this.props.messages.length;
  }

  scrollToBottom(){
    let messageContainer = ReactDOM.findDOMNode(this.refs.messages);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  render(){
    let { messages, username, isLoadingMessages, onMessageDelete } = this.props;

    return (
      <div className="row message-box" ref="messages">
        <div className="col-md-12">
          <MessageList messages={messages} username={username} onMessageDelete={onMessageDelete} />
        </div>
        {isLoadingMessages && <Throbber />}
      </div>
    )
  }
}

export default MessageBox;
