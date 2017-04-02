import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Nav from './components/layout/Nav';
import ChatContainer from './components/chat/ChatContainer';

import { getMessagesForRoom, createMessage, deleteMessage } from './data/chat/messages';

import { formatMessages } from './utils/chat';

export default class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      username: '',
      showUsernameModal: false,
      messages: [],
      isLoadingMessages: true,
      alertMessage: 'Welcome to miniShare!',
      alertStyle: 'success'
    };

    this.decryptIfHash = this.decryptIfHash.bind(this);
    // ChatRoom
    this.loadChatroom = this.loadChatroom.bind(this);
    this.onSendMessage = this.onSendMessage.bind(this);
    this.populateMessages = this.populateMessages.bind(this);
    this.onMessageDelete = this.onMessageDelete.bind(this);
  }

  decryptIfHash(){
    let passphrase = document.location.hash;
    // let email = sha384(passphrase + '@cryptag.org')
    // miniLock.crypto.getKeyPair()
  }

  componentDidMount(){
    this.decryptIfHash();
  }

  promptForUsername(){
    this.setState({
      showUsernameModal: true
    });
  }

  loadUsername(){
    let { username } = this.state;

    if (!username){
      this.promptForUsername();
    }
  }

  loadChatroom(roomKey){
    this.setState({
      currentRoomKey: roomKey
    });
    this.loadChatMessages(roomKey);
  }

  loadChatMessages(roomKey){
    getMessagesForRoom(roomKey)
      .then(this.populateMessages, (respErr) => {
        console.log("Error getting messages for room: " + respErr);
      });
  }

  populateMessages(response){
    let messages = formatMessages(response.body);
    this.setState({
      messages: messages,
      isLoadingMessages: false
    });
  }

  onSendMessage(message){
    this.setState({
      isLoadingMessages: true
    });

    let { currentRoomKey, username } = this.state;
    createMessage(currentRoomKey, message, username)
      .then((response) => {
        this.loadChatMessages(currentRoomKey);
      }, (respErr) => {
        console.log("Error creating message: " + respErr);
      });
  }

  onMessageDelete(messageKey, onDeleteSuccess){
    // messageKey will look like: "id:d4f371df-1e0e-4a67-5c8b-bbae29917ddd"
    let { currentRoomKey } = this.state;
    deleteMessage(currentRoomKey, messageKey)
      .then((response) => {
        this.loadChatMessages(currentRoomKey);
      }, (respErr) => {
        console.log("Error deleting messsage: " + respErr);
      });
  }

  render(){
    return (
      <main>
        <Nav />
        <ChatContainer
          messages={this.state.messages}
          username={this.state.username}
          onSendMessage={this.onSendMessage}
          onMessageDelete={this.onMessageDelete}
          isLoadingMessages={this.state.isLoadingMessages} />
      </main>
    );
  }
}

App.propTypes = {}

ReactDOM.render(<App />, document.getElementById('root'));
