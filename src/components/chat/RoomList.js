import React from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";


const RoomList = ({
}) => {
  const displayRoomName = (passphrase) => {
    // 'OneTwoThreeFourFive' => 'One Two Three'
    return passphrase.replace(/([A-Z])/g, '_$1').slice(1).split('_').slice(0, 3).join(' ');
  };

  // Append the current room to our room list if it isn't there already
  let roomList = JSON.parse( localStorage.getItem('roomList') || '[]' );
  const passphraseFromUrlHash = document.location.hash.slice(1);
  if (passphraseFromUrlHash.length > 0 && !roomList.includes(passphraseFromUrlHash)) {
    roomList = [ ...roomList, passphraseFromUrlHash ];
    localStorage.setItem('roomList', JSON.stringify(roomList));
  }

  const changeRoom = (passphrase) => {
    // just update fragment and reload page for now
    window.location.assign(window.location.origin + '/#' + passphrase);
    window.location.reload(true);
  };

  return (
    <div className="room-list">
      <h4>Chat Rooms</h4>
      <ul>
        {roomList.map((passphrase) => {
          return (
            <li className={passphrase === passphraseFromUrlHash ? "current-room": ""} key={passphrase} onClick={() => changeRoom(passphrase)}>
              {displayRoomName(passphrase)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

RoomList.propTypes = {};

const mapStateToProps = (reduxState) => ({
});

export default connect(mapStateToProps)(RoomList);
