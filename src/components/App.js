import React, { Component } from 'react';
import $ from 'jquery';
import miniLock from '../utils/miniLock';
import { connect } from 'react-redux';
import {
  sendMessage,
  addMessage,
  setUserStatus,
  clearMessages,
  setUsername,
  initConnection,
  initChat,
  initApplication
} from '../actions/chatActions';

import {
  dismissAlert
} from '../actions/alertActions';

import Header from './layout/Header';

import ChatContainer from './chat/ChatContainer';

import { formatMessages } from '../utils/chat';
import { tagByPrefixStripped } from '../utils/tags';

import UsernameModal from './modals/Username';
import InfoModal from './modals/InfoModal';
import PincodeModal from './modals/PincodeModal';

const USERNAME_KEY = 'username';

import {
  SERVER_ERROR_PREFIX, AUTH_ERROR, ON_CLOSE_RECONNECT_MESSAGE,
  USER_STATUS_DELAY_MS
} from '../constants/messaging';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showUsernameModal: false,
      showInfoModal: false,
    };

    this.onSendMessage = this.onSendMessage.bind(this);

    this.onCloseUsernameModal = this.onCloseUsernameModal.bind(this);

    this.onClosePincodeModal = this.onClosePincodeModal.bind(this);
    this.onSetPincode = this.onSetPincode.bind(this);

  }

  componentDidMount() {
    if(!this.props.pincodeRequired){
      this.props.initConnection();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.pincodeRequired && this.props.shouldConnect) {
      this.props.initConnection();
    }
  }

  promptForUsername = () => {
    this.setState({
      showUsernameModal: true
    });
  }


  onClosePincodeModal() {
    this.setState({
      showPincodeModal: false
    });
  }

  onSetPincode(pincode = "") {
    if (!pincode || pincode.endsWith("--")) {
      this.onError('Invalid pincode!');
      return;
    }
    this.props.initConnection(pincode);
  }

  onCloseUsernameModal() {
    this.setState({
      showUsernameModal: false
    });
  }

  toggleInfoModal = () => {
    this.setState((prevState) => {
      return { showInfoModal: !prevState.showInfoModal }
    })
  }

  onSendMessage(message) {
    const { username } = this.props;
    this.props.sendMessage({ message, username });
  }

  render() {
    const { showInfoModal } = this.state;
    const { messages, username, alertMessage, alertStyle, statuses, pincodeRequired, usernameRequired, setUsername } = this.props;
    let previousUsername = '';
    if (!username) {
      previousUsername = localStorage.getItem(USERNAME_KEY) || '';
    }

    return (
      <div id="page">
        <Header
          statuses={statuses}
          promptForUsername={this.promptForUsername}
          toggleInfoModal={this.toggleInfoModal} />

        <main className="encloser">

          {pincodeRequired && <PincodeModal
            showModal={pincodeRequired}
            onSetPincode={this.onSetPincode}
            onCloseModal={this.onClosePincodeModal} />}

          {usernameRequired && <UsernameModal
            previousUsername={previousUsername}
            username={username}
            showModal={usernameRequired}
            onSetUsername={setUsername}
            onCloseModal={this.onCloseUsernameModal} />}

          <ChatContainer
            alertMessage={alertMessage}
            alertStyle={alertStyle}
            onAlertDismiss={this.props.dismissAlert}
            messages={messages}
            username={username}
            onSendMessage={this.onSendMessage}
            messageInputFocus={!this.state.showUsernameModal} />
          <InfoModal
            showModal={showInfoModal}
            toggleInfoModal={this.toggleInfoModal} />
        </main>
      </div>
    );
  }
}

App.propTypes = {}

const mapStateToProps = (reduxState) => {
  return { ...reduxState.chat, ...reduxState.alert };
};

const mapDispatchToProps = (dispatch) => {
  return {
    sendMessage: ({ message, username }) =>
    dispatch(sendMessage({ message, username })),
    initConnection: (pincode) => dispatch(initConnection(pincode)),
    initApplication: () => dispatch(initApplication()),
    setUsername: (username) => dispatch(setUsername(username)),
    dismissAlert: () => dispatch(dismissAlert())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
