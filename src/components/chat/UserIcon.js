import React from 'react';
import PropTypes from 'prop-types';

import { FaUsers } from 'react-icons/fa';

const UserIcon = ({ onToggleUserList }) => {

  return (
    <div className="users-icon">
      <FaUsers size={30} onClick={onToggleUserList} />
    </div>
  );
};

UserIcon.propTypes = {
  onToggleUserList: PropTypes.func.isRequired
};

export default UserIcon;
