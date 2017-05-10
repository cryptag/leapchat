import React, { Component } from 'react';

const btoa = require('btoa');
const atob = require('atob');

import AlertContainer from './general/AlertContainer';
import ChatContainer from './chat/ChatContainer';

import { formatMessages } from '../utils/chat';
import { tagByPrefixStripped } from '../utils/tags';
import { getEmail, getPassphrase, generateMessageKey } from '../utils/encrypter';

import UsernameModal from './modals/Username';

const USERNAME_KEY = 'username';

import { SERVER_ERROR_PREFIX, AUTH_ERROR, ON_CLOSE_RECONNECT_MESSAGE } from '../constants/messaging';

export default class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      username: '',
      showUsernameModal: true,
      authToken: '',
      keyPair: null,
      mID: '', // miniLock ID
      wsConnection: null, // WebSockets connection for getting/sending messages
      messages: [],
      showAlert: false,
      alertMessage: '',
      alertStyle: 'success'
    };

    this.onError = this.onError.bind(this);
    this.displayAlert = this.displayAlert.bind(this);
    this.onAlertDismiss = this.onAlertDismiss.bind(this);

    this.createMessage = this.createMessage.bind(this);
    this.sendMessageToServer = this.sendMessageToServer.bind(this);

    this.onSendMessage = this.onSendMessage.bind(this);
    this.onReceiveMessage = this.onReceiveMessage.bind(this);

    this.onCloseUsernameModal = this.onCloseUsernameModal.bind(this);
    this.onSetUsername = this.onSetUsername.bind(this);

    this.keypairFromURLHash = this.keypairFromURLHash.bind(this);
    this.decryptMessage = this.decryptMessage.bind(this);
    this.decryptAuthToken = this.decryptAuthToken.bind(this);

    // authentication methods
    this.login = this.login.bind(this);
    this.onLoginError = this.onLoginError.bind(this);

    // websocket connection methods
    this.newWebSocket = this.newWebSocket.bind(this);
    this.setWsConnection = this.setWsConnection.bind(this);
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

      $('.message-form textarea').focus();
      // this.refs.messageBox.focus();
    }
  }

  displayAlert(message, alertStyle){
    console.log(message);

    this.setState({
      showAlert: true,
      alertMessage: message,
      alertStyle: alertStyle // Changing this changes nothing...
    })
  }

  onError(errStr) {
    this.displayAlert(errStr, 'error');
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

  getAuthUrl(){
    let protocol = document.location.protocol.slice(0, -1);
    let host = document.location.host;
    return `${protocol}://${host}/api/login`;
  }

  getAuthHeaders(mID){
    return {
      'X-Minilock-Id': mID
    }
  }

  login(){
    let authenticationUrl = this.getAuthUrl();
    fetch(authenticationUrl, {
      headers: this.getAuthHeaders(this.state.mID)
    })
      .then(this.onLoginSuccess)
      .then((body) => {
        this.decryptMessage(body, this.decryptAuthToken)
      })
      .catch(this.onLoginError);
  }

  onLoginError(reason){
    console.log("Error logging in:", reason);
    if (reason.toString() === "TypeError: Failed to fetch"){
      console.log("Trying to log in again");
      setTimeout(this.login, 2000);
    }
  }

  onLoginSuccess(response){
    return response.blob();
  }

  decryptMessage(message, decryptFileCallback){
    console.log("Trying to decrypt", message);

    miniLock.crypto.decryptFile(message,
                                this.state.mID,
                                this.state.keyPair.secretKey,
                                decryptFileCallback);
  }

  // From https://github.com/kaepora/miniLock/blob/ffea0ecb7a619d921129b8b4aed2081050ec48c1/src/js/miniLock.js#L592-L595 --
  //
  //    miniLock.crypto.decryptFile's callback is passed these parameters:
  //      file: Decrypted file object (blob),
  //      saveName: File name for saving the file (String),
  //      senderID: Sender's miniLock ID (Base58 string)
  decryptAuthToken(fileBlob, saveName, senderID){
    let reader = new FileReader();
    reader.addEventListener("loadend", () => {
      let authToken = reader.result;
      console.log('authToken:', authToken);
      this.setState({
        authToken: authToken,
        messages: [] // TODO: Once messages have server-visible IDs, just fetch new
      })
      this.setWsConnection();
    });

    reader.readAsText(fileBlob);
  }

  newWebSocket(url){
    let ws = new WebSocket(url);

    ws.onopen = (event) => {
      let authToken = this.state.authToken;
      console.log("Sending auth token", authToken);
      event.target.send(authToken);
    };

    ws.onclose = (event) => {
      this.onError(ON_CLOSE_RECONNECT_MESSAGE);
      this.noopifyWs(event.target);
      setTimeout(this.login, 2000);
    }

    ws.onmessage = (event) => {
      let data = JSON.parse(event.data);
      console.log("Event data:", data);
      if (data.error){
        this.onError(SERVER_ERROR_PREFIX + data.error);
        if (data.error === AUTH_ERROR){
          // ws.onclose() is about to be called; will trigger reconnect
        }
        return;
      }

      this.clearConnectError();

      // TODO: Ensure that incoming messages are correctly ordered in
      // the DOM; this code is racy, since onReceiveMessage() is a
      // callback and is what adds messages to `this.state.messages`.
      for (let i = 0; i < data.ephemeral.length; i++) {
        let binStr = atob(data.ephemeral[i]);
        let binStrLength = binStr.length;
        let array = new Uint8Array(binStrLength);

        for(let i = 0; i < binStrLength; i++) {
          array[i] = binStr.charCodeAt(i);
        }
        let msg = new Blob([array], {type: 'application/octet-stream'});

        let messageKey = generateMessageKey(i);
        // basically curries onReceiveMessage with generated messageKey
        const decryptCallback = this.onReceiveMessage.bind(this, messageKey);
        this.decryptMessage(msg, decryptCallback);
      }
    };

    return ws;
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

  onReceiveMessage(msgKey, fileBlob, saveName, senderID){
    console.log(msgKey, fileBlob, saveName, senderID);

    let tags = saveName.split('|||');
    console.log("Tags on received message:", tags);

    // TODO: Make more efficient later
    let isTypeChatmessage = tags.includes('type:chatmessage');
    let isTypePicture = tags.includes('type:picture');
    let isTypeRoomName = tags.includes('type:roomname');
    let isTypeRoomDescription = tags.includes('type:roomdescription');

    if (isTypeChatmessage){
      let reader = new FileReader();
      reader.addEventListener("loadend", () => {
        let obj = JSON.parse(reader.result);
        console.log('Decrypted message:', obj);

        let fromUsername = tagByPrefixStripped(tags, 'from:');

        let maybeSenderID = '';
        if (senderID !== this.state.mID){
          maybeSenderID = ' (' + senderID + ')';
        }

        let msg = {
          key: msgKey,
          from: fromUsername + maybeSenderID,
          msg: obj.msg
        }
        this.setState({
          messages: [...this.state.messages, msg]
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

  getWebsocketUrl(){
    let host = document.location.host;
    let wsProtocol = document.location.protocol.replace('http', 'ws');
    return `${wsProtocol}//${host}/api/ws/messages/all`;
  }

  setWsConnection(){
    let websocketUrl = this.getWebsocketUrl();
    let wsConnection = this.newWebSocket(websocketUrl);

    // Kill previous wsConnection connection
    if (this.state.wsConnection){
      this.state.wsConnection.close();
    }

    this.setState({
      wsConnection: wsConnection
    });
  }

  keypairFromURLHash(){
    let { passphrase, isNewRoom } = getPassphrase(document.location.hash);

    if (isNewRoom){
      document.location.hash = '#' + passphrase;
      this.displayAlert('New room created!', 'success');
    }

    console.log("URL hash is `%s`", passphrase);

    let email = getEmail(passphrase);

    miniLock.crypto.getKeyPair(passphrase, email, (keyPair) => {
      // Code from https://github.com/kaepora/miniLock/blob/ffea0ecb7a619d921129b8b4aed2081050ec48c1/src/js/ui.js#L78
      // May be useful:
      // https://github.com/kaepora/miniLock/blob/master/src/js/miniLock.js#L18
      miniLock.session.keys = keyPair
      miniLock.session.keyPairReady = true

      let mID = miniLock.crypto.getMiniLockID(keyPair.publicKey);
      console.log("mID ==", mID);

      this.setState({
        keyPair: keyPair,
        mID: mID
      });

      this.login();
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
    let reader = new FileReader();
    reader.addEventListener("loadend", () => {
      // From https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string#comment55137593_11562550
      let b64encMinilockFile = btoa([].reduce.call(
        new Uint8Array(reader.result),
        function(p, c) {
          return p + String.fromCharCode(c)
        }, ''));

      let msgForServer = {
        ephemeral: [b64encMinilockFile]
      };
      this.state.wsConnection.send(JSON.stringify(msgForServer));
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
