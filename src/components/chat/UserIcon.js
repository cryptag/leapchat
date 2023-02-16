import React, { Component } from 'react';
import PropTypes from 'prop-types';

import FaGroup from 'react-icons/lib/fa/group';

const UserIcon = ({ onToggleUserList }) => {

  return (
    <div className="users-icon">
      <FaGroup size={30} onClick={onToggleUserList} />
    </div>
  );
};

UserIcon.propTypes = {
  onToggleUserList: PropTypes.func.isRequired
};

export default UserIcon;
