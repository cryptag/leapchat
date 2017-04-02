
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
var sha384 = require('js-sha512').sha384;

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
      isLoadingMessages: true,
      authToken: '',
      keyPair: null,
      mID: '', // miniLock ID
      wsMsgs: null, // WebSockets connection for getting/sending messages
      messages: [],
      alertMessage: 'Welcome to miniShare!',
      alertStyle: 'success'
    };

    this.loadChatroom = this.loadChatroom.bind(this);
    this.populateMessages = this.populateMessages.bind(this);

    this.onSendMessage = this.onSendMessage.bind(this);
    this.onDeleteMessage = this.onDeleteMessage.bind(this);

    this.onSetUsernameClick = this.onSetUsernameClick.bind(this);
    this.onCloseUsernameModal = this.onCloseUsernameModal.bind(this);
    this.onSetUsername = this.onSetUsername.bind(this);

    this.decryptMsg = this.decryptMsg.bind(this);
    this.newWebSocket = this.newWebSocket.bind(this);
    this.keypairFromURLHash = this.keypairFromURLHash.bind(this);
    this.promptForUsername = this.promptForUsername.bind(this);
    this.loadUsername = this.loadUsername.bind(this);
  }

  componentDidMount(){
    this.keypairFromURLHash();
  }

  decryptMsg(msg, callback){
    console.log("Trying to decrypt", msg);
    miniLock.crypto.decryptFile(msg,
                                this.state.mID,
                                this.state.keyPair.secretKey,
                                callback);
  }

  login(callback){
    let that = this;

    let host = document.location.host;
    // TODO: Use https, not http, in production
    fetch("http://" + host + "/api/login", {
      headers: {
        'X-Minilock-Id': this.state.mID
      },
    }).then(function(resp){
      return resp.blob();
    }).then(function(body){
      that.decryptMsg(body, function(authToken){
        that.setState({
          authToken: authToken
        })
        callback();
      })
    })
  }

  newWebSocket(url){
    let ws = new WebSocket(url);
    ws.first = true;

    let that = this;

    ws.onopen = function(event){
      let authToken = that.state.authToken;
      console.log("Sending auth token `%s`", authToken);
      ws.send(authToken);
    };

    ws.onmessage = function(event){
      let data = event.data;
      console.log("Event data:", data);
    };

    return ws;
  }

  keypairFromURLHash(){
    let passphrase = document.location.hash;
    console.log("URL hash is `%s`", passphrase);
    let email = sha384(passphrase + '@cryptag.org');

    let that = this;

    miniLock.crypto.getKeyPair(passphrase, email, function(keyPair){
      // Code from https://github.com/kaepora/miniLock/blob/ffea0ecb7a619d921129b8b4aed2081050ec48c1/src/js/ui.js#L78
      // May be useful:
      // https://github.com/kaepora/miniLock/blob/master/src/js/miniLock.js#L18
      miniLock.session.keys = keyPair
      miniLock.session.keyPairReady = true

      console.log("keyPair ==", keyPair);
      let mID = miniLock.crypto.getMiniLockID(keyPair.publicKey);
      console.log("mID ==", mID);

      that.setState({
        keyPair: keyPair,
        mID: mID
      });

      let host = document.location.host;

      that.login(function(){
        // TODO: Use wss, not ws, in production
        let wsMsgs = that.newWebSocket("ws://" + host + "/api/ws/messages/all");

        that.setState({
          wsMsgs: wsMsgs
        });
      })
    })
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
