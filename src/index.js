import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Nav from './components/layout/Nav';
import ChatContainer from './components/chat/ChatContainer';

import { getMessagesForRoom, createMessage, deleteMessage } from './data/chat/messages';

import { formatMessages } from './utils/chat';

import Throbber from './components/general/Throbber';
import UsernameModal from './components/modals/Username';

const USERNAME_KEY = 'username';

export default class App extends Component {
  constructor(props){
    super(props);

    let username = localStorage.getItem(USERNAME_KEY);

    this.state = {
      username: username,
      showUsernameModal: true,
      messages: [],
      isLoadingMessages: true,
      alertMessage: 'Welcome to miniShare!',
      alertStyle: 'success'
    };

    this.decryptIfHash = this.decryptIfHash.bind(this);

    this.loadChatroom = this.loadChatroom.bind(this);
    this.populateMessages = this.populateMessages.bind(this);

    this.onSendMessage = this.onSendMessage.bind(this);
    this.onDeleteMessage = this.onDeleteMessage.bind(this);

    this.onSetUsernameClick = this.onSetUsernameClick.bind(this);
    this.onCloseUsernameModal = this.onCloseUsernameModal.bind(this);
    this.onSetUsername = this.onSetUsername.bind(this);
  }

  decryptIfHash(){
    let passphrase = document.location.hash;
    // let email = sha384(passphrase + '@cryptag.org')
    // miniLock.crypto.getKeyPair()
  }

  componentDidMount(){
    this.decryptIfHash();
    this.loadChatroom("");
  }

  onSetUsernameClick(e){
    this.setState({
      showUsernameModal: true
    });
  }

  onCloseUsernameModal(){
    this.setState({
      showUsernameModal: false
    });
  }

  onSetUsername(username){
    localStorage.setItem(USERNAME_KEY, username);
    this.setState({
      'username': username
    });
    this.onCloseUsernameModal();
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

  onDeleteMessage(messageKey, onDeleteSuccess){
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
    let { username, showUsernameModal } = this.state;

    return (
      <main>
        <Nav />
        {showUsernameModal && <UsernameModal
                                username={username}
                                showModal={showUsernameModal}
                                onSetUsername={this.onSetUsername}
                                onCloseModal={this.onCloseUsernameModal} />}
        <ChatContainer
          messages={this.state.messages}
          username={this.state.username}
          onSendMessage={this.onSendMessage}
          onDeleteMessage={this.onDeleteMessage}
          isLoadingMessages={this.state.isLoadingMessages} />
      </main>
    );
  }
}

App.propTypes = {}

ReactDOM.render(<App />, document.getElementById('root'));
