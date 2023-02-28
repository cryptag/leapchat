import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";

import { Button } from 'react-bootstrap';
import { FaShareAlt } from 'react-icons/fa';

import { UserStatusIcon } from './UserStatusIcons';

import SharingModal from '../modals/SharingModal';

const UserList = ({
  username,
  statuses,
  displayUserList,
  onToggleModalVisibility,
}) => {
  const [showSharingModal, setShowSharingModal] = useState(false);
  const currentUsername = username;

  const userStatuses = Object.keys(statuses).map(username => {
    const status = statuses[username];
    return { status, username };
  });

  const styleUserList = () => {
    return { display: displayUserList ? "block" : "none" };
  };

  return (
    <div className="users-list" style={styleUserList()}>
      <ul>
        {userStatuses.map((userStatus, i) => {
          return (
            <li key={i}>
              <UserStatusIcon
                username={userStatus.username}
                status={userStatus.status}
                isCurrentUser={userStatus.username === currentUsername}
                onToggleModalVisibility={onToggleModalVisibility} />
            </li>
          );
        })}
      </ul>
      <div className="invite-users" >
        <Button
          className="icon-button"
          variant="link"
          onClick={() => setShowSharingModal(true)}>
          Invite Users <FaShareAlt size={15} />
        </Button>
        {showSharingModal && <SharingModal
          isVisible={showSharingModal}
          onClose={() => setShowSharingModal(false)} />}
      </div>
      
    </div>
  );
};

UserList.propTypes = {
  username: PropTypes.string.isRequired,
  displayUserList: PropTypes.bool.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired
};

const mapStateToProps = (reduxState) => ({
  statuses: reduxState.chat.statuses
});

export default connect(mapStateToProps)(UserList);
