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
import SettingsModal from './modals/SettingsModal';
import SharingModal from './modals/SharingModal';
import SearchModal from './modals/SearchModal';

class App extends Component {
  constructor(props) {
    super(props);

    // Default to false on initial render so audio doesn't attempt to play before 
    // user interacts with page (which triggers console.error)
    const isAudioEnabled = false;

    this.state = {
      isAudioEnabled: isAudioEnabled,
      modals: {
        username: {
          isVisible: false
        },
        info: {
          isVisible: false
        },
        settings: {
          isVisible: false
        },
        pincode: {
          isVisible: false
        },
        sharing: {
          isVisible: false
        },
        search: {
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
    if (!this.props.pincodeRequired && this.props.shouldConnect) {
      this.props.initConnection();
    }
  }

  onToggleModalVisibility = (modalName, isVisible) => {
    let modalsState = {...this.state.modals};
    modalsState[modalName].isVisible = isVisible;
    this.setState({
      modals: modalsState
    });
  }

  onClosePincodeModal = () => {
    this.setState({
      showPincodeModal: false
    });
  }

  onSetIsAudioEnabled = (isAudioEnabled) => {
    this.setState({
      isAudioEnabled: isAudioEnabled
    });
    localStorage.setItem("isAudioEnabled", isAudioEnabled);
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
    this.onToggleModalVisibility('username', false);
  }

  onSendMessage = (message) => {
    const { username } = this.props;
    this.props.sendMessage({ message, username });
  }

  render() {
    const {
      messages,
      username,
      alertMessage,
      alertStyle,
      statuses,
      pincodeRequired,
      previousUsername } = this.props;

    const { isAudioEnabled } = this.state;

    const showSettingsModal = this.state.modals.settings.isVisible;
    const showInfoModal = this.state.modals.info.isVisible;
    const showSharingModal = this.state.modals.sharing.isVisible;
    const showSearchModal = this.state.modals.search.isVisible;

    let showUsernameModal = this.state.modals.username.isVisible;
    showUsernameModal = !pincodeRequired && (showUsernameModal || username === '');

    const chatInputFocus = !pincodeRequired && !showUsernameModal && username !== '';

    return (
      <div id="page">
        <Header
          username={username}
          statuses={statuses}
          onToggleModalVisibility={this.onToggleModalVisibility} />

        <main className="encloser">

          {pincodeRequired && <PincodeModal
            showModal={pincodeRequired}
            onSetPincode={this.onSetPincode}
            onToggleModalVisibility={this.onToggleModalVisibility} />}

          {showUsernameModal && <UsernameModal
            previousUsername={previousUsername}
            username={username}
            isVisible={showUsernameModal}
            onSetUsername={this.onSetUsername}
            onToggleModalVisibility={this.onToggleModalVisibility}
            onSetIsAudioEnabled={this.onSetIsAudioEnabled} />}

          {showSettingsModal && <SettingsModal 
            isVisible={showSettingsModal}
            onToggleModalVisibility={this.onToggleModalVisibility} />}

          {showInfoModal && <InfoModal
            isVisible={showInfoModal}
            onToggleModalVisibility={this.onToggleModalVisibility} />}

          {showSharingModal && <SharingModal
            isVisible={showSharingModal}
            onToggleModalVisibility={this.onToggleModalVisibility} />}

          {showSearchModal && <SearchModal 
            username={username}
            isVisible={showSearchModal}
            messages={messages}
            onToggleModalVisibility={this.onToggleModalVisibility} />}

          <ChatContainer
            alertMessage={alertMessage}
            alertStyle={alertStyle}
            onAlertDismiss={this.props.dismissAlert}
            messages={messages}
            username={username}
            onSendMessage={this.onSendMessage}
            messageInputFocus={chatInputFocus}
            isAudioEnabled={isAudioEnabled}
            onSetIsAudioEnabled={this.onSetIsAudioEnabled}
            onToggleModalVisibility={this.onToggleModalVisibility} />

        </main>

      </div>
    );
  }
}

App.propTypes = {};

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
