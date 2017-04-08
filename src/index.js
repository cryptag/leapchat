import React, { Component } from 'react';
import ReactDOM from 'react-dom';

let sha384 = require('js-sha512').sha384;
let btoa = require('btoa');
let atob = require('atob');

import Nav from './components/layout/Nav';
import ChatContainer from './components/chat/ChatContainer';

import { formatMessages } from './utils/chat';
import { tagByPrefixStripped } from './utils/tags';

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
      showAlert: false,
      alertMessage: 'Welcome to miniShare!',
      alertStyle: 'success'
    };

    this.onError = this.onError.bind(this);

    this.populateMessages = this.populateMessages.bind(this);
    this.createMessage = this.createMessage.bind(this);
    this.sendMessageToServer = this.sendMessageToServer.bind(this);

    this.onSendMessage = this.onSendMessage.bind(this);
    // this.onDeleteMessage = this.onDeleteMessage.bind(this);

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

  onError(errStr) {
    console.log(errStr);

    this.setState({
      showAlert: true,
      alertMessage: errStr,
      alertStyle: 'error' // Changing this changes nothing...
    })
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

  decryptMsg(msg, callback){
    console.log("Trying to decrypt", msg);

    // From https://github.com/kaepora/miniLock/blob/ffea0ecb7a619d921129b8b4aed2081050ec48c1/src/js/miniLock.js#L592-L595 --
    //
    //		Callback is passed these parameters:
    //			file: Decrypted file object (blob),
    //			saveName: File name for saving the file (String),
    //			senderID: Sender's miniLock ID (Base58 string)
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
      that.decryptMsg(body, function(fileBlob, saveName, senderID){
        let reader = new FileReader();
        reader.addEventListener("loadend", function() {
          let authToken = reader.result;
          console.log('authToken:', authToken);
          that.setState({
            authToken: authToken
          })
          callback();
        });

        reader.readAsText(fileBlob);  // TODO: Add error handling
      })
    }).catch((reason) => {
      console.log("Error logging in:", reason);
    })
  }

  newWebSocket(url){
    let ws = new WebSocket(url);
    ws.first = true;

    let that = this;

    ws.onopen = function(event){
      let authToken = that.state.authToken;
      console.log("Sending auth token", authToken);
      ws.send(authToken);
    };

    ws.onmessage = function(event){
      let data = JSON.parse(event.data);
      console.log("Event data:", data);
      if (data.error){
        that.onError('Error from server: ' + data.error);
        return;
      }

      // TODO: Ensure ordering of incoming messages
      for (let i = 0; i < data.ephemeral.length; i++) {
        let binStr = atob(data.ephemeral[i]);
        let binStrLength = binStr.length;
        let array = new Uint8Array(binStrLength);

        for(let i = 0; i < binStrLength; i++) {
          array[i] = binStr.charCodeAt(i);
        }
        let msg = new Blob([array], {type: 'application/octet-stream'});

        // TODO: Do smarter msgKey creation
        let date = new Date();
        let msgKey = date.toGMTString() + ' - ' +
              date.getSeconds() + '.' + date.getMilliseconds();
        miniLock.util.resetCurrentFile(); // omgwtf
        that.decryptMsg(msg, that.onReceiveMessage.bind(this, msgKey));
      }
    };

    return ws;
  }

  onReceiveMessage(msgKey, file, saveName, senderID){
    console.log(file, saveName, senderID);

    let tags = saveName.split('|||');
    console.log("Tags on received message:", tags);

    // TODO: Make more efficient later
    let isTypeChatmessage = tags.includes('type:chatmessage');
    let isTypePicture = tags.includes('type:picture');
    let isTypeRoomName = tags.includes('type:roomname');
    let isTypeRoomDescription = tags.includes('type:roomdescription');

    if (isTypeChatmessage || true){ // FIXME; remove '|| true' ASAP
      let reader = new FileReader();
      reader.addEventListener("loadend", function() {
        let obj = JSON.parse(reader.result);
        console.log('Decrypted message:', obj);

        let fromUsername = tagByPrefixStripped(tags, 'from:');

        let msg = {
          key: msgKey,
          from: fromUsername + ' (' + senderID + ')',
          msg: obj.msg
        }
        this.state.messages.push(msg)
      });

      reader.readAsText(fileBlob);  // TODO: Add error handling
      return;
    }

    // TODO: Handle other types

    console.log(`onReceiveMessage: got non-chat message with tags ${tags}`);
  }

  keypairFromURLHash(){
    let passphrase = document.location.hash || '#';
    passphrase = passphrase.slice(1);

    console.log("URL hash is `%s`", passphrase);
    if (!passphrase){
      return;
    }
    let email = sha384(passphrase) + '@cryptag.org';

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

    this.createMessage(message);
  }

  createMessage(message){
    console.log("Creating message with contents `%s`", message);

    let contents = {msg: message};
    let fileBlob = new Blob([JSON.stringify(contents)],
                            {type: 'application/json'})
    let saveName = ['from:'+this.state.username, 'type:chatmessage'].join('|||');

    let mID = this.state.mID;

    console.log("Encrypting file blob");

    miniLock.crypto.encryptFile(fileBlob, saveName, [mID],
                                mID, this.state.keyPair.secretKey,
                                this.sendMessageToServer);
  }

  sendMessageToServer(fileBlob, saveName, senderMinilockID){
    let that = this;

    let reader = new FileReader();
    reader.addEventListener("loadend", function() {
      // From https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string#comment55137593_11562550
      let b64encMinilockFile = btoa([].reduce.call(
        new Uint8Array(reader.result),
        function(p, c) {
          return p + String.fromCharCode(c)
        }, ''));

      let msgForServer = {
        ephemeral: [b64encMinilockFile]
      };
      that.state.wsMsgs.send(JSON.stringify(msgForServer));
    })

    reader.readAsArrayBuffer(fileBlob);  // TODO: Add error handling
  }

  // onDeleteMessage(messageKey, onDeleteSuccess){
  //   // messageKey will look like: "id:d4f371df-1e0e-4a67-5c8b-bbae29917ddd"
  //   let { currentRoomKey } = this.state;
  //   deleteMessage(currentRoomKey, messageKey)
  //     .then((response) => {
  //       this.loadChatMessages(currentRoomKey);
  //     }, (respErr) => {
  //       console.log("Error deleting messsage: " + respErr);
  //     });
  // }

  render(){
    let { username, showUsernameModal } = this.state;

    console.log('Rendering...');

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
