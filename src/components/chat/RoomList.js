import React from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";


const RoomList = ({
}) => {
  const displayRoomName = (passphrase) => {
    // 'OneTwoThreeFourFive' => 'One Two Three'
    return passphrase.replace(/([A-Z])/g, '_$1').slice(1).split('_').slice(0, 3).join(' ');
  }

  // Append the current room to our room list if it isn't there already
  let roomList = JSON.parse( localStorage.getItem('roomList') || '[]' );
  const passphraseFromUrlHash = document.location.hash.slice(1);
  if (passphraseFromUrlHash.length > 0 && !roomList.includes(passphraseFromUrlHash)) {
    roomList = [ ...roomList, passphraseFromUrlHash ];
    localStorage.setItem('roomList', JSON.stringify(roomList));
  }

  const styleRoomList = () => {
    return {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      marginTop: '48px'
    };
  };

  const styleRoomName = (passphrase) => {
    const lightPurple = '#aa6fe3';
    return {
      color: passphrase === passphraseFromUrlHash ? lightPurple : 'white',
      width: '100%'
    }
  }

  const setPassphrase = (passphrase) => {
    console.log('setPassphrase() -- TODO: Disconnect the WebSocket, change the current URL hash, auth again, connect via WebSocket');
  }

  return (
    <div style={styleRoomList()}>
      <h4>Chat Rooms</h4>
      <ul>
        {roomList.map((passphrase) => {
          return (
            <li key={passphrase} style={styleRoomName(passphrase)} onClick={() => setPassphrase(passphrase)}>
              {displayRoomName(passphrase)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

RoomList.propTypes = {
};

const mapStateToProps = (reduxState) => ({
});

export default connect(mapStateToProps)(RoomList);
