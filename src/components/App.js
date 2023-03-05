import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Capacitor } from '@capacitor/core';
import {
  setUsername,
  initAuth,
  initConnection,
  initChat
} from '../store/actions/chatActions';

import { initiateSessionAndConnect } from '../utils/sessions';

import Header from './layout/Header';

import ChatContainer from './chat/ChatContainer';

import PincodeModal from './modals/PincodeModal';
import UsernameModal from './modals/Username';

// evaluate on initial render only, not on every re-render.
const isNewRoom = Boolean(!document.location.hash);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modals: {
        username: {
          isVisible: false
        },
        pincode: {
          isVisible: false
        }
      }
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
    if (!this.props.pincodeRequired && this.props.shouldConnect){
      this.onInitConnection();
    }
  }

  onSetPincode = (pincode = "") => {
    if (!pincode || pincode.endsWith("--")) {
      this.onError('Invalid pincode!');
      return;
    }
    this.onInitConnection(pincode);
  };


  onInitConnection(pincode='') {
    this.props.initAuth();

    let urlHash;
    if (Capacitor.getPlatform() === 'web'){
      urlHash = document.location.hash + pincode;
    } else {
      // for local testing in capacitor, just put in a valid fragment
      urlHash = '';
    }

    initiateSessionAndConnect(
      this.props.initConnection,
      this.createWebSession,
      urlHash,
    );
  }

  createWebSession(passphrase) {
    if (Capacitor.getPlatform() === "web"){
      document.location.hash = "#" + passphrase;
    }
    else {
      // Works in Capacitor! Added it like this to avoid merge conflicts
      document.location.hash = "#" + passphrase;
    }
  }

  onToggleModalVisibility = (modalName, isVisible) => {
    let modalsState = {...this.state.modals};
    modalsState[modalName].isVisible = isVisible;
    this.setState({
      modals: modalsState
    });
  };

  onClosePincodeModal = () => {
    this.setState({
      showPincodeModal: false
    });
  };

  render() {
    const {
      username,
      pincodeRequired,
      previousUsername,
      authenticating,
      connecting,
      connected,
    } = this.props;

    let showUsernameModal = this.state.modals.username.isVisible;
    showUsernameModal = !pincodeRequired && (showUsernameModal || username === '');

    const chatInputFocus = !pincodeRequired && !showUsernameModal && username !== '';

    return (
      <div id="page">
        <Header
          username={username}
          onToggleModalVisibility={this.onToggleModalVisibility} />

        {pincodeRequired && <PincodeModal
          showModal={pincodeRequired}
          onSetPincode={this.onSetPincode}
          onToggleModalVisibility={this.onToggleModalVisibility} />}

        {showUsernameModal && <UsernameModal
          previousUsername={previousUsername}
          username={username}
          isVisible={showUsernameModal}
          isNewRoom={isNewRoom}
          setUsername={this.props.setUsername}
          authenticating={authenticating}
          connecting={connecting}
          connected={connected}
          onToggleModalVisibility={this.onToggleModalVisibility} />}

        <main className="encloser">

          <ChatContainer
            messageInputFocus={chatInputFocus}
            onToggleModalVisibility={this.onToggleModalVisibility} />

        </main>

      </div>
    );
  }
}

App.propTypes = {};

const mapStateToProps = (reduxState) => {
  return {
    username: reduxState.chat.username,
    previousUsername: reduxState.chat.previousUsername,
    pincodeRequired: reduxState.chat.pincodeRequired,
    shouldConnect: reduxState.chat.shouldConnect,
    connecting: reduxState.chat.connecting,
    connected: reduxState.chat.connected,
    authenticating: reduxState.chat.authenticating,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    initChat: () => dispatch(initChat()),
    initAuth: () => dispatch(initAuth()),
    initConnection: ({
      authToken,
      secretKey,
      mID,
      isNewRoom
    }) => dispatch(initConnection({
      authToken,
      secretKey,
      mID,
      isNewRoom
    })),
    setUsername: (username) => dispatch(setUsername(username)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);