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

import UsernameModal from './modals/Username';
import InfoModal from './modals/InfoModal';
import PincodeModal from './modals/PincodeModal';

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

  onShowUsernameModal = () => {
    this.setState({
      showUsernameModal: true
    });
  }

  onCloseUsernameModal = () => {
    this.setState({
      showUsernameModal: false
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

  onSetUsername = (username) => {
    this.props.setUsername(username);
    this.setState({
      showUsernameModal: false
    });
  }

  onToggleInfoModal = () => {
    this.setState((prevState) => {
      return { showInfoModal: !prevState.showInfoModal }
    })
  }

  onSendMessage = (message) => {
    const { username } = this.props;
    this.props.sendMessage({ message, username });
  }

  render() {
    const { showInfoModal } = this.state;
    const {
      messages,
      username,
      alertMessage,
      alertStyle,
      statuses,
      pincodeRequired,
      previousUsername } = this.props;

    let { showUsernameModal } = this.state;
    showUsernameModal = !pincodeRequired && (showUsernameModal || username === '');

    const chatInputFocus = !pincodeRequired && !showUsernameModal && username !== '';

    return (
      <div id="page">
          <Header
            username={username}
            statuses={statuses}
            onShowUsernameModal={this.onShowUsernameModal}
            onToggleInfoModal={this.onToggleInfoModal} />

          <main className="encloser">

            {pincodeRequired && <PincodeModal
              showModal={pincodeRequired}
              onSetPincode={this.onSetPincode}
              onCloseModal={this.onClosePincodeModal} />}

            {showUsernameModal && <UsernameModal
              previousUsername={previousUsername}
              username={username}
              isVisible={showUsernameModal}
              onSetUsername={this.onSetUsername}
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
              onToggleInfoModal={this.onToggleInfoModal} />

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
