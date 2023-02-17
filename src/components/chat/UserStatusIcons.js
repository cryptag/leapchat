import React from 'react';
import PropTypes from 'prop-types';

import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import FaCircle from 'react-icons/lib/fa/circle';
import FaMinusCircle from 'react-icons/lib/fa/minus-circle';
import FaPencilSquare from 'react-icons/lib/fa/pencil-square';

const editUsernameTooltip = (
  <Tooltip id="edit-username-tooltip">Edit Username</Tooltip>
);

export const UserStatusIcon = ({
  username,
  status,
  isCurrentUser,
  onShowUsernameModal
}) => {
  let statusIcon = <FaMinusCircle style={styleOffline} />;
  if (status === 'viewing') {
    statusIcon = <FaCircle style={styleViewing} />;
  } else if (status === 'online') {
    statusIcon = <FaCircle style={styleOnline} />;
  }
  return (
    <div style={styleUserStatus}>
      {statusIcon}
      {username}
      {isCurrentUser && <span>&nbsp;(me)</span> }
      <span style={styleEditUsername} data-testid="edit-username">
        {isCurrentUser &&
          <OverlayTrigger placement="bottom" overlay={editUsernameTooltip} delayShow={300} delayHide={150}>
            <FaPencilSquare onClick={onShowUsernameModal} size={19} />
          </OverlayTrigger>
        }
      </span>
    </div>
  );
};

UserStatusIcon.propTypes = {
  username: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  isCurrentUser: PropTypes.bool.isRequired,
  onShowUsernameModal: PropTypes.func.isRequired
};

const styleUserStatus = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

const styleDots = {
  marginTop: '.2em',
  marginRight: '.2em',
  marginBottom: '.2em'
};

const styleViewing = Object.assign(
  { color: 'green' },
  styleDots
);

const styleOnline = Object.assign(
  { color: 'yellow' },
  styleDots
);

const styleOffline = Object.assign(
  { color: 'gray' },
  styleDots
);

const styleEditUsername = {
  cursor: 'pointer',
  marginLeft: 'auto',
  marginRight: '2px'  // For optical vertical alignment with gear icon
};