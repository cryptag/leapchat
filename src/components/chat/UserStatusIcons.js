import React from 'react';
import PropTypes from 'prop-types';

import FaCircle from 'react-icons/lib/fa/circle';
import FaMinusCircle from 'react-icons/lib/fa/minus-circle';
import FaPencilSquare from 'react-icons/lib/fa/pencil-square';

export const ViewingUserIcon = (props) => {
  const { username, isCurrentUser, onShowUsernameModal } = props;
  return (
    <div style={styleUserStatus}>
      <FaCircle style={styleViewing} />
      {username}
      {isCurrentUser && <span>&nbsp;(me)</span> }
      <span style={styleEditUsername}>
        {isCurrentUser &&
          <FaPencilSquare onClick={onShowUsernameModal} size={19} />
        }
      </span>
    </div>
  );
}

ViewingUserIcon.propTypes = {
  username: PropTypes.string.isRequired,
  isCurrentUser: PropTypes.bool.isRequired,
  onShowUsernameModal: PropTypes.func.isRequired
}

export const OnlineUserIcon = () => <FaCircle style={styleOnline} />

export const OfflineUserIcon = () => <FaMinusCircle style={styleOffline} />

const styleUserStatus = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
}

const styleDots = {
  marginRight: '.2em'
}

const styleViewing = Object.assign(
  { color: 'green' },
  styleDots
)

const styleOnline = Object.assign(
  { color: 'yellow' },
  styleDots
)

const styleOffline = Object.assign(
  { color: 'gray' },
  styleDots
)

const styleEditUsername = {
  marginLeft: 'auto',
  marginRight: '2px'  // For optical vertical alignment with gear icon
}
