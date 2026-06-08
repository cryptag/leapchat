import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FiUserPlus } from 'react-icons/fi';

import { UserStatusIcon } from './UserStatusIcons';
import SharingModal from '../modals/SharingModal';

const UserList = ({ username, statuses, displayUserList, onToggleModalVisibility }) => {
  const [showSharingModal, setShowSharingModal] = useState(false);

  const userStatuses = Object.keys(statuses).map(u => ({ status: statuses[u], username: u }));

  if (!displayUserList) return null;

  return (
    <>
      {userStatuses.map((us, i) => (
        <UserStatusIcon
          key={i}
          username={us.username}
          status={us.status}
          isCurrentUser={us.username === username}
          onToggleModalVisibility={onToggleModalVisibility} />
      ))}

      <div className="sidebar-footer">
        <button className="sidebar-footer-btn invite" onClick={() => setShowSharingModal(true)}>
          <FiUserPlus size={15} />
          Invite People
        </button>
      </div>

      {showSharingModal && <SharingModal
        isVisible={showSharingModal}
        onClose={() => setShowSharingModal(false)} />}
    </>
  );
};

UserList.propTypes = {
  username: PropTypes.string.isRequired,
  displayUserList: PropTypes.bool.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ statuses: state.chat.statuses });
export default connect(mapStateToProps)(UserList);
