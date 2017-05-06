import React, { Component } from 'react';

let sha384 = require('js-sha512').sha384;
let btoa = require('btoa');
let atob = require('atob');

import AlertContainer from './general/AlertContainer';
import ChatContainer from './chat/ChatContainer';

import { formatMessages } from '../utils/chat';
import { tagByPrefixStripped } from '../utils/tags';
import { genPassphrase } from '../data/minishare';

import UsernameModal from './modals/Username';

const USERNAME_KEY = 'username';

const SERVER_ERROR_PREFIX = "Error from server: ";
const AUTH_ERROR = "Error authorizing you"; // Must match Go's miniware.AuthError
const ON_CLOSE_RECONNECT_MESSAGE = "Message WebSocket closed. Reconnecting...";

export default class App extends Component {
  constructor(props){
    super(props);

    let protocol = document.location.protocol.slice(0, -1);

    this.state = {
      username: '',
      showUsernameModal: true,
      authToken: '',
      keyPair: null,
      mID: '', // miniLock ID
      wsMsgs: null, // WebSockets connection for getting/sending messages
      messages: [],
      protocol: protocol,
      showAlert: false,
      alertMessage: '',
      alertStyle: 'success'
    };

    this.onError = this.onError.bind(this);
    this.alert = this.alert.bind(this);
    this.onAlertDismiss = this.onAlertDismiss.bind(this);

    this.populateMessages = this.populateMessages.bind(this);
    this.createMessage = this.createMessage.bind(this);
    this.sendMessageToServer = this.sendMessageToServer.bind(this);

    this.onSendMessage = this.onSendMessage.bind(this);
    this.onReceiveMessage = this.onReceiveMessage.bind(this);

    this.onCloseUsernameModal = this.onCloseUsernameModal.bind(this);
    this.onSetUsername = this.onSetUsername.bind(this);

    this.decryptMsg = this.decryptMsg.bind(this);
    this.newWebSocket = this.newWebSocket.bind(this);
    this.keypairFromURLHash = this.keypairFromURLHash.bind(this);
    this.setWsMsgs = this.setWsMsgs.bind(this);
    this.login = this.login.bind(this);
    this.clearConnectError = this.clearConnectError.bind(this);
    this.promptForUsername = this.promptForUsername.bind(this);
    this.loadUsername = this.loadUsername.bind(this);
  }

  componentDidMount(){
    this.keypairFromURLHash();
  }

  componentDidUpdate(){
    if (!this.state.showUsernameModal){
      // TODO: Find better way to do
      // this. `findDOMNode(this.refs.messageBox).focus()` doesn't
      // work here, and `this.refs.messageBox.focus()` doesn't work
      // here, because we don't have a reference to the component;
      // it's not in `this.refs`.

      $('.message-form input').focus();
      // this.refs.messageBox.focus();
    }
  }

  alert(errStr, alertStyle){
    console.log(errStr);

    this.setState({
      showAlert: true,
      alertMessage: errStr,
      alertStyle: alertStyle // Changing this changes nothing...
    })
  }

  onError(errStr) {
    this.alert(errStr, 'error');
  }

  onAlertDismiss(){
    this.setState({
      showAlert: false,
      alertMessage: ''
    });
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
    //    Callback is passed these parameters:
    //      file: Decrypted file object (blob),
    //      saveName: File name for saving the file (String),
    //      senderID: Sender's miniLock ID (Base58 string)
    miniLock.crypto.decryptFile(msg,
                                this.state.mID,
                                this.state.keyPair.secretKey,
                                callback);
  }

  login(callback=this.setWsMsgs){
    let that = this;

    let host = document.location.host;
    fetch(this.state.protocol + "://" + host + "/api/login", {
      headers: {
        'X-Minilock-Id': this.state.mID
      },
    }).then(function(resp){
      return resp.blob();
    }).then(function(body){
      that.decryptMsg(body, function(fileBlob, saveName, senderID){
        // Read fileBlob, which contains the auth token
        let reader = new FileReader();
        reader.addEventListener("loadend", function() {
          let authToken = reader.result;
          console.log('authToken:', authToken);
          that.setState({
            authToken: authToken
          })
          callback();
        });

        reader.readAsText(fileBlob);
      })
    }).catch((reason) => {
      console.log("Error logging in:", reason);
      if (reason.toString() === "TypeError: Failed to fetch"){
        console.log("Trying to log in again");
        setTimeout(that.login, 2000);
      }
    })
  }

  clearConnectError(){
    // Sending worked, therefore we're connected. If we just
    // reconnected, clear the error. (No pun intended.)
    let authErrStr = SERVER_ERROR_PREFIX + AUTH_ERROR;
    let alertMessage = this.state.alertMessage;
    let alert = (alertMessage !== authErrStr &&
                 alertMessage !== ON_CLOSE_RECONNECT_MESSAGE) ? alertMessage : '';

    this.setState({
      alertMessage: alert,
      showAlert: !!alert
    });
  }

  newWebSocket(url){
    let ws = new WebSocket(url);
    let that = this;

    ws.onopen = function(event){
      let authToken = that.state.authToken;
      console.log("Sending auth token", authToken);
      ws.send(authToken);
    };

    ws.onclose = function(event){
      that.onError(ON_CLOSE_RECONNECT_MESSAGE);
      that.noopifyWs(ws);
      setTimeout(that.login, 2000);
    }

    ws.onmessage = function(event){
      let data = JSON.parse(event.data);
      console.log("Event data:", data);
      if (data.error){
        that.onError(SERVER_ERROR_PREFIX + data.error);
        if (data.error === AUTH_ERROR){
          // ws.onclose() is about to be called; will trigger reconnect
        }
        return;
      }

      that.clearConnectError();

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
              date.getSeconds() + '.' + date.getMilliseconds() + '.' + i;
        that.decryptMsg(msg, that.onReceiveMessage.bind(that, msgKey));
      }
    };

    return ws;
  }

  onReceiveMessage(msgKey, fileBlob, saveName, senderID){
    console.log(msgKey, fileBlob, saveName, senderID);
    let that = this;

    let tags = saveName.split('|||');
    console.log("Tags on received message:", tags);

    // TODO: Make more efficient later
    let isTypeChatmessage = tags.includes('type:chatmessage');
    let isTypePicture = tags.includes('type:picture');
    let isTypeRoomName = tags.includes('type:roomname');
    let isTypeRoomDescription = tags.includes('type:roomdescription');

    if (isTypeChatmessage){
      let reader = new FileReader();
      reader.addEventListener("loadend", function() {
        let obj = JSON.parse(reader.result);
        console.log('Decrypted message:', obj);

        let fromUsername = tagByPrefixStripped(tags, 'from:');

        let maybeSenderID = '';
        if (senderID !== that.state.mID){
           maybeSenderID = ' (' + senderID + ')';
        }

        let msg = {
          key: msgKey,
          from: fromUsername + maybeSenderID,
          msg: obj.msg
        }
        that.setState({
          messages: that.state.messages.concat([msg])
        })
      });

      reader.readAsText(fileBlob);  // TODO: Add error handling
      return;
    }

    // TODO: Handle other types

    console.log(`onReceiveMessage: got non-chat message with tags ${tags}`);
  }

  noopifyWs(ws){
    if (!ws){
      return;
    }
    let noop = function(){};
    ws.onopen = noop;
    ws.onclose = noop;
    ws.onerror = noop;
    ws.onmessage = noop;
  }

  setWsMsgs(){
    let host = document.location.host;
    let wsProto = (this.state.protocol === 'https') ? 'wss' : 'ws';
    let wsMsgs = this.newWebSocket(wsProto + "://" + host +
                                   "/api/ws/messages/all");

    // Kill previous wsMsgs connection
    if (this.state.wsMsgs){
      this.state.wsMsgs.close();
    }

    this.setState({
      wsMsgs: wsMsgs
    });
  }

  keypairFromURLHash(){
    let passphrase = document.location.hash || '#';
    passphrase = passphrase.slice(1);

    // Generate new room for user if none specified (that is, if the
    // URL hash is blank)
    if (!passphrase){
      passphrase = genPassphrase();
      document.location.hash = '#' + passphrase;
      this.alert('New room created!', 'success');
    }

    console.log("URL hash is `%s`", passphrase);

    let email = sha384(passphrase) + '@cryptag.org';

    let that = this;

    miniLock.crypto.getKeyPair(passphrase, email, function(keyPair){
      // Code from https://github.com/kaepora/miniLock/blob/ffea0ecb7a619d921129b8b4aed2081050ec48c1/src/js/ui.js#L78
      // May be useful:
      // https://github.com/kaepora/miniLock/blob/master/src/js/miniLock.js#L18
      miniLock.session.keys = keyPair
      miniLock.session.keyPairReady = true

      let mID = miniLock.crypto.getMiniLockID(keyPair.publicKey);
      console.log("mID ==", mID);

      that.setState({
        keyPair: keyPair,
        mID: mID
      });

      that.login();
    })
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
    });
  }

  onSendMessage(message){
    this.createMessage(message);
  }

  createMessage(message){
    console.log("Creating message with contents `%s`", message);

    let contents = {msg: message};
    let fileBlob = new Blob([JSON.stringify(contents)],
                            {type: 'application/json'})
    let saveName = ['from:'+this.state.username, 'type:chatmessage'].join('|||');
    fileBlob.name = saveName;

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

  render(){
    let { showAlert, alertMessage, alertStyle } = this.state;
    let { username, showUsernameModal } = this.state;

    let previousUsername = '';
    if (!username){
      previousUsername = localStorage.getItem(USERNAME_KEY) || '';
    }

    console.log('Rendering...');

    return (
      <main>
        <AlertContainer
          showAlert={showAlert}
          message={alertMessage}
          alertStyle={alertStyle}
          onAlertDismiss={this.onAlertDismiss} />

        {showUsernameModal && <UsernameModal
                                username={username || previousUsername}
                                showModal={showUsernameModal}
                                onSetUsername={this.onSetUsername}
                                onCloseModal={this.onCloseUsernameModal} />}
        <ChatContainer
          messages={this.state.messages}
          username={this.state.username}
          onSendMessage={this.onSendMessage} />
      </main>
    );
  }
}

App.propTypes = {}
