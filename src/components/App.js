import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  setUsername,
  initConnection,
  initChat
} from '../store/actions/chatActions';

import Header from './layout/Header';

import ChatContainer from './chat/ChatContainer';

import PincodeModal from './modals/PincodeModal';
import UsernameModal from './modals/Username';

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
  };

  onClosePincodeModal = () => {
    this.setState({
      showPincodeModal: false
    });
  };

  onSetIsAudioEnabled = (isAudioEnabled) => {
    this.setState({
      isAudioEnabled: isAudioEnabled
    });
    localStorage.setItem("isAudioEnabled", isAudioEnabled);
  };

  onSetPincode = (pincode = "") => {
    if (!pincode || pincode.endsWith("--")) {
      this.onError('Invalid pincode!');
      return;
    }
    this.props.initConnection(pincode);
  };

  render() {
    const {
      username,
      pincodeRequired,
      previousUsername } = this.props;

    const { isAudioEnabled } = this.state;

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
          setUsername={this.props.setUsername}
          onToggleModalVisibility={this.onToggleModalVisibility}
          onSetIsAudioEnabled={this.onSetIsAudioEnabled} />}

        <main className="encloser">

          <ChatContainer
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
  return {
    username: reduxState.chat.username,
    previousUsername: reduxState.chat.previousUsername,
    pincodeRequired: reduxState.chat.pincodeRequired,
    shouldConnect: reduxState.chat.shouldConnect,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    initChat: () => dispatch(initChat()),
    initConnection: (pincode) => dispatch(initConnection(pincode)),
    initApplication: () => dispatch(initApplication()),
    setUsername: (username) => dispatch(setUsername(username)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);