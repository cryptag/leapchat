import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  sendMessage,
  setUsername,
  initConnection,
  initChat
} from '../actions/chatActions';

import {
  dismissAlert
} from '../actions/alertActions';

import Header from './layout/Header';

import ChatContainer from './chat/ChatContainer';

import { tagByPrefixStripped } from '../utils/tags';

import UsernameModal from './modals/Username';
import InfoModal from './modals/InfoModal';
import PincodeModal from './modals/PincodeModal';

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

  }

  componentDidMount() {
    this.props.initChat();
    this.connectIfNeeded();
  }

  componentDidUpdate(prevProps, prevState) {
    this.connectIfNeeded();
  }

  connectIfNeeded() {
    if (!this.props.pincodeRequired && this.props.shouldConnect) {
      this.props.initConnection();
    }
  }

  handleShowSettings = () => {
    this.setState({
      showUsernameModal: true
    });
  }


  onClosePincodeModal = () => {
    this.setState({
      showPincodeModal: false
    });
  }

  onSetPincode = (pincode = "") => {
    if (!pincode || pincode.endsWith("--")) {
      this.onError('Invalid pincode!');
      return;
    }
    this.props.initConnection(pincode);
  }

  onCloseUsernameModal = () => {
    this.setState({
      showUsernameModal: false
    });
  }

  handleSetUsername = (username) => {
    this.setState({
      showUsernameModal: false
    });
    this.props.setUsername(username);
  }

  toggleInfoModal = () => {
    this.setState((prevState) => {
      return { showInfoModal: !prevState.showInfoModal }
    })
  }

  onSendMessage = (message) => {
    const { username } = this.props;
    this.props.sendMessage({ message, username });
  }

  render() {
    const { showInfoModal, showUsernameModal } = this.state;
    const {
      messages,
      username,
      alertMessage,
      alertStyle,
      statuses,
      pincodeRequired,
      previousUsername } = this.props;

    const displaySettings = !pincodeRequired && (showUsernameModal || username === '');
    const chatInputFocus = !pincodeRequired && !showUsernameModal && username !== '';

    return (
      <div id="page">

        <Header
          statuses={statuses}
          showSettings={this.handleShowSettings}
          toggleInfoModal={this.toggleInfoModal} />

        <main className="encloser">

          {pincodeRequired && <PincodeModal
            showModal={pincodeRequired}
            onSetPincode={this.onSetPincode}
            onCloseModal={this.onClosePincodeModal} />}

          {displaySettings && <UsernameModal
            previousUsername={previousUsername}
            username={username}
            showModal={displaySettings}
            onSetUsername={this.handleSetUsername}
            onCloseModal={this.onCloseUsernameModal} />}

          <ChatContainer
            alertMessage={alertMessage}
            alertStyle={alertStyle}
            onAlertDismiss={this.props.dismissAlert}
            messages={messages}
            username={username}
            onSendMessage={this.onSendMessage}
            messageInputFocus={chatInputFocus} />

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
    sendMessage: ({ message, username }) => dispatch(sendMessage({ message, username })),
    initChat: () => dispatch(initChat()),
    initConnection: (pincode) => dispatch(initConnection(pincode)),
    initApplication: () => dispatch(initApplication()),
    setUsername: (username) => dispatch(setUsername(username)),
    dismissAlert: () => dispatch(dismissAlert())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
