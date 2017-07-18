import React, { Component } from 'react';
import $ from 'jquery';
import miniLock from '../utils/miniLock';
import { connect } from 'react-redux';
import {
  addMessage,
  setUserStatus,
  clearMessages,
  setUsername
} from '../actions/chatActions';

const btoa = require('btoa');
const atob = require('atob');

import Header from './layout/Header';

import ChatContainer from './chat/ChatContainer';

import { formatMessages } from '../utils/chat';
import { tagByPrefixStripped } from '../utils/tags';
import { getEmail, getPassphrase, generateMessageKey } from '../utils/encrypter';
import { detectPageVisible } from '../utils/pagevisibility';
import { nowUTC } from '../utils/time';

import UsernameModal from './modals/Username';

const USERNAME_KEY = 'username';
const BACKEND_URL = process.env.BACKEND_URL;

import {
  SERVER_ERROR_PREFIX, AUTH_ERROR, ON_CLOSE_RECONNECT_MESSAGE,
  USER_STATUS_DELAY_MS
} from '../constants/messaging';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showUsernameModal: true,
      authToken: '',
      keyPair: null,
      keyPairReady: false,
      mID: '', // miniLock ID
      wsConnection: null, // WebSockets connection for getting/sending messages
      statuses: [],
      status: '',
      alertMessage: '',
      alertStyle: 'success'
    };

    this.onError = this.onError.bind(this);
    this.displayAlert = this.displayAlert.bind(this);
    this.onAlertDismiss = this.onAlertDismiss.bind(this);

    this.createMessage = this.createMessage.bind(this);
    this.sendMessageToServer = this.sendMessageToServer.bind(this);
    this.wsSend = this.wsSend.bind(this);

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

    this.userStatusManager = this.userStatusManager.bind(this);
    this.setStatusViewing = this.setStatusViewing.bind(this);
    this.setStatusOnline = this.setStatusOnline.bind(this);
    this.setStatusOffline = this.setStatusOffline.bind(this);

    // websocket connection methods
    this.newWebSocket = this.newWebSocket.bind(this);
    this.setWsConnection = this.setWsConnection.bind(this);
    this.clearConnectError = this.clearConnectError.bind(this);

    this.promptForUsername = this.promptForUsername.bind(this);
    this.loadUsername = this.loadUsername.bind(this);
  }

  componentDidMount() {
    detectPageVisible(this.setStatusViewing,
      this.setStatusOnline,
      this.setStatusOffline);
    this.keypairFromURLHash();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.status !== this.state.status ||
      prevProps.username !== this.props.username) {
      this.sendStatusMessage();
    }
  }

  /**
   * Displays bootstrap alert fixed at top of page
   * @param {string} message - Text to display in the alert.
   * @param {string} alertStyle - {'success', 'info', 'danger', 'warning'}
   */
  displayAlert(message, alertStyle = 'success') {

    this.setState({
      alertMessage: message,
      alertStyle: alertStyle
    })
  }

  /**
   * Curries displayAlert with warning style alert.
   * @param {string} message - Text to display in the alert.
   */
  onError(errStr) {
    this.displayAlert(errStr, 'warning');
  }

  /**
   * Closes the alert.
   */
  onAlertDismiss() {
    this.setState({
      alertMessage: ''
    });
  }

  promptForUsername() {
    this.setState({
      showUsernameModal: true
    });
  }

  loadUsername() {
    const { username } = this.props;

    if (!username) {
      this.promptForUsername();
    }
  }

  getAuthUrl() {
    return `${BACKEND_URL}/api/login`;
  }

  getAuthHeaders(mID) {
    return {
      'X-Minilock-Id': mID
    }
  }

  login() {
    let authenticationUrl = this.getAuthUrl();
    fetch(authenticationUrl, {
      headers: this.getAuthHeaders(this.state.mID)
    })
      .then(this.onLoginSuccess)
      .then((body) => {
        this.decryptMessage(body, this.decryptAuthToken)
      })
      .catch((reason) => {
        if (reason.then) {
          reason.then((errjson) => {
            this.onLoginError(errjson.error);
          })
          return;
        }
        this.onLoginError(reason);
        return;
      });
  }

  onLoginError(reason) {
    console.log("Error logging in:", reason);
    if (reason.toString() === "TypeError: Failed to fetch") {
      console.log("Trying to log in again");
      setTimeout(this.login, 2000);
      return;
    }
    this.displayAlert(reason, 'danger');
  }

  onLoginSuccess(response) {
    if (response.status !== 200) {
      throw response.json();
    }
    return response.blob();
  }

  decryptMessage(message, decryptFileCallback) {
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
  decryptAuthToken(fileBlob, saveName, senderID) {
    let reader = new FileReader();
    reader.addEventListener("loadend", () => {
      let authToken = reader.result;
      console.log('authToken:', authToken);
      this.setState({
        authToken: authToken
      })
      this.setWsConnection();
    });

    reader.readAsText(fileBlob);
  }

  setStatusViewing() {
    this.setState({
      status: 'viewing' // green
    })
  }

  setStatusOnline() {
    this.setState({
      status: 'online' // yellow
    })
  }

  setStatusOffline() {
    this.setState({
      status: 'offline' // gray
    })
  }

  userStatusManager(wsConn) {
    // Every `USER_STATUS_DELAY_MS` seconds, send current status
    let sendStatus = setInterval(() => {
      if (wsConn.noopified) {
        clearInterval(sendStatus);
        return;
      }

      this.sendStatusMessage();
    }, USER_STATUS_DELAY_MS)

    // Remove old statuses from state.statuses
    let removeOldStatuses = setInterval(() => {
      if (wsConn.noopified) {
        clearInterval(removeOldStatuses);
        return;
      }

      let statuses = this.state.statuses;
      let numOld = 0;
      let now = nowUTC();

      for (let i = 0, len = statuses.length; i < len; i++) {
        if (now - statuses[i].created >= USER_STATUS_DELAY_MS + 2000) {
          numOld++;
        } else {
          break;
        }
      }

      if (numOld === 0) {
        return;
      }

      // Uses `this.state.statuses` rather than local `statuses` var
      // to prevent race where new statuses were received while the
      // above for-loop was executing. (New statuses are always
      // appended to `this.state.statuses`, never prepended.)
      this.setState({
        statuses: this.state.statuses.slice(numOld)
      })

    }, USER_STATUS_DELAY_MS)
  }

  newWebSocket(url) {
    let ws = new WebSocket(url);
    ws.firstMsg = true;

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
      if (ws.firstMsg) {
        this.props.clearAllMessages();
        ws.firstMsg = false;

        this.userStatusManager(ws);
      }
      let data = JSON.parse(event.data);
      console.log("Event data:", data);
      if (data.error) {
        this.onError(SERVER_ERROR_PREFIX + data.error);
        if (data.error === AUTH_ERROR) {
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

        for (let i = 0; i < binStrLength; i++) {
          array[i] = binStr.charCodeAt(i);
        }
        let msg = new Blob([array], { type: 'application/octet-stream' });

        let messageKey = generateMessageKey(i);
        // basically curries onReceiveMessage with generated messageKey
        const decryptCallback = this.onReceiveMessage.bind(this, messageKey);
        this.decryptMessage(msg, decryptCallback);
      }
    };

    return ws;
  }

  clearConnectError() {
    // Sending worked, therefore we're connected. If we just
    // reconnected, clear the error. (No pun intended.)
    let authErrStr = SERVER_ERROR_PREFIX + AUTH_ERROR;
    let { alertMessage } = this.state;
    let alert = (alertMessage !== authErrStr &&
      alertMessage !== ON_CLOSE_RECONNECT_MESSAGE) ? alertMessage : '';

    this.setState({
      alertMessage: alert
    });
  }

  onReceiveMessage(msgKey, fileBlob, saveName, senderID) {
    console.log(msgKey, fileBlob, saveName, senderID);

    let tags = saveName.split('|||');
    console.log("Tags on received message:", tags);

    // TODO: Make more efficient later
    let isTypeChatmessage = tags.includes('type:chatmessage');
    let isTypeUserStatus = tags.includes('type:userstatus');
    let isTypePicture = tags.includes('type:picture');
    let isTypeRoomName = tags.includes('type:roomname');
    let isTypeRoomDescription = tags.includes('type:roomdescription');

    if (isTypeChatmessage) {
      let reader = new FileReader();
      reader.addEventListener("loadend", () => {
        let obj = JSON.parse(reader.result);
        console.log('Decrypted message:', obj);

        let fromUsername = tagByPrefixStripped(tags, 'from:');

        let maybeSenderId = '';
        if (senderID !== this.state.mID) {
          maybeSenderId = ' (' + senderID + ')';
        }

        this.props.addNewMessage({
          key: msgKey,
          fromUsername,
          maybeSenderId,
          message: obj.msg
        });

      });

      reader.readAsText(fileBlob);  // TODO: Add error handling
      return;
    } else if (isTypeUserStatus) {
      let fromUsername = tagByPrefixStripped(tags, 'from:');
      let userStatus = tagByPrefixStripped(tags, 'status:');

      let status = {
        key: msgKey,
        from: fromUsername,
        status: userStatus,
        created: nowUTC() // TODO: use message.created from server
      }

      this.setState({
        statuses: [...this.state.statuses, status]
      })

      return;
    }

    // TODO: Handle other types

    console.log(`onReceiveMessage: got non-chat message with tags ${tags}`);
  }

  noopifyWs(ws) {
    if (!ws) {
      return;
    }
    let noop = function () { };
    ws.onopen = noop;
    ws.onclose = noop;
    ws.onerror = noop;
    ws.onmessage = noop;
    ws.noopified = true;
  }

  getWebsocketUrl() {
    return `${BACKEND_URL}/api/ws/messages/all`;
  }

  setWsConnection() {
    let websocketUrl = this.getWebsocketUrl();
    let wsConnection = this.newWebSocket(websocketUrl);

    // Kill previous wsConnection connection
    if (this.state.wsConnection) {
      this.state.wsConnection.close();
    }

    this.setState({
      wsConnection: wsConnection
    });
  }

  keypairFromURLHash() {
    let { passphrase, isNewRoom } = getPassphrase(document.location.hash);

    if (isNewRoom) {
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
        keyPairReady: true,
        mID: mID
      }, this.login);
    })
  }

  onCloseUsernameModal() {
    this.setState({
      showUsernameModal: false
    });
  }

  onSetUsername(username) {
    if (!username) {
      this.onError('Invalid username!');
      return;
    }
    localStorage.setItem(USERNAME_KEY, username);

    this.props.setUsername(username);

    this.setState({
      status: 'viewing'
    });

    this.onCloseUsernameModal();
  }

  onSendMessage(message) {
    this.createMessage(message);
  }

  sendJsonMessage(contents, tags, ttl_secs = 0) {
    console.log("Creating message with contents", contents);

    let saveName = tags.join('|||');
    let fileBlob = new Blob([JSON.stringify(contents)],
      { type: 'application/json' })
    fileBlob.name = saveName;

    console.log("Encrypting file blob");

    let mID = this.state.mID;
    if (this.state.keyPairReady) {
      miniLock.crypto.encryptFile(fileBlob, saveName, [mID],
        mID, this.state.keyPair.secretKey,
        this.sendMessageToServer.bind(this, ttl_secs));
    } else {
      let interval = setInterval(() => {
        if (!this.state.keyPairReady) {
          return;
        }

        miniLock.crypto.encryptFile(fileBlob, saveName, [mID],
          mID, this.state.keyPair.secretKey,
          this.sendMessageToServer.bind(this, ttl_secs));
        clearInterval(interval);
      }, 500)
    }
  }

  sendStatusMessage() {
    // This is in a setInterval because sometimes `this.state.keyPair`
    // isn't quite ready yet
    const interval = setInterval(() => {
      const username = this.props.username;
      let status = this.state.status;

      if (!username || !status || !this.state.keyPairReady) {
        return;
      }

      let contents = {};  // Unused. TODO: Make more efficient?
      let tags = ['from:' + username, 'type:userstatus', 'status:' + status];
      let ttl_secs = USER_STATUS_DELAY_MS / 1000;

      this.sendJsonMessage(contents, tags, ttl_secs);
      clearInterval(interval);
    }, 500)
  }

  createMessage(message) {
    let contents = { msg: message };
    let tags = ['from:' + this.props.username, 'type:chatmessage'];

    this.sendJsonMessage(contents, tags);
  }

  sendMessageToServer(ttl_secs, fileBlob, saveName, senderMinilockID) {
    let reader = new FileReader();
    reader.addEventListener("loadend", () => {
      // From https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string#comment55137593_11562550
      let b64encMinilockFile = btoa([].reduce.call(
        new Uint8Array(reader.result),
        function (p, c) {
          return p + String.fromCharCode(c)
        }, ''));

      let msgForServer = {
        ephemeral: [b64encMinilockFile]
      };
      if (ttl_secs > 0) {
        msgForServer.to_server = {
          ttl_secs: ttl_secs
        }
      }
      this.wsSend(msgForServer);
    })

    reader.readAsArrayBuffer(fileBlob);  // TODO: Add error handling
  }

  wsSend(payload) {
    if (this.state.keyPairReady &&
      this.state.wsConnection &&
      this.state.wsConnection.readyState === WebSocket.OPEN) {
      this.state.wsConnection.send(JSON.stringify(payload));
    } else {
      // This is in a setInterval because sometimes
      // `this.state.wsConnection` isn't quite ready yet
      let interval = setInterval(() => {
        if (!this.state.keyPairReady ||
          !this.state.wsConnection ||
          this.state.wsConnection.readyState !== WebSocket.OPEN) {
          return;
        }

        this.state.wsConnection.send(JSON.stringify(payload));
        clearInterval(interval);
      }, 500)
    }
  }

  render() {
    const { alertMessage, alertStyle } = this.state;
    const { showUsernameModal } = this.state;
    const { statuses } = this.state;
    const { messages, username } = this.props;

    let previousUsername = '';
    if (!username) {
      previousUsername = localStorage.getItem(USERNAME_KEY) || '';
    }

    return (
      <div className="encloser">
        <Header
          statuses={statuses}
          promptForUsername={this.promptForUsername} />

        <main>

          {showUsernameModal && <UsernameModal
            previousUsername={previousUsername}
            username={username}
            showModal={showUsernameModal}
            onSetUsername={this.onSetUsername}
            onCloseModal={this.onCloseUsernameModal} />}
          <ChatContainer
            alertMessage={alertMessage}
            alertStyle={alertStyle}
            onAlertDismiss={this.onAlertDismiss}
            messages={messages}
            username={username}
            onSendMessage={this.onSendMessage}
            messageInputFocus={!this.state.showUsernameModal} />
        </main>
      </div>
    );
  }
}

App.propTypes = {}

const mapStateToProps = (reduxState) => {
  return reduxState.chat;
};

const mapDispatchToProps = (dispatch) => {
  return {
    addNewMessage: ({ key, fromUsername, maybeSenderId, message }) =>
      dispatch(addMessage({ key, fromUsername, maybeSenderId, message })),
    addNewUserStatus: ({ fromUsername, userStatus, created }) =>
      dispatch(addUserStatus({ fromUsername, userStatus, created })),
    clearAllMessages: () => dispatch(clearMessages()),
    setUsername: (username) => dispatch(setUsername(username))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);