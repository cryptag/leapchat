import React, { Component, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import UserIcon from '../chat/UserIcon';
import UserList from '../chat/UserList';
import Logo from './Logo';
import Settings from './Settings';
import Info from './Info';
import { closePicker } from '../../store/actions/chatActions';

const Header = ({
  username,
  onToggleModalVisibility
}) => {
  const [showUserList, setShowUserList] = useState(false);

  const onToggleUserList = () => {
    setShowUserList((current) => !current);
  };

  return (
    <header onClick={closePicker}>
      <div className="logo-container">
        <div id="logo-info">
          <Logo />
          <Info />
        </div>
        <Settings />
      </div>
      <UserIcon onToggleUserList={onToggleUserList} />
      <UserList
        username={username}
        displayUserList={showUserList}
        onToggleModalVisibility={onToggleModalVisibility} />
    </header>
  );
};

Header.propTypes = {
  username: PropTypes.string.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired
};

export default connect(null, { closePicker })(Header);
