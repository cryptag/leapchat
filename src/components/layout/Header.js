import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FiUsers } from 'react-icons/fi';

import Logo from './Logo';
import Settings from './Settings';
import Info from './Info';
import UserList from '../chat/UserList';
import { closePicker } from '../../store/actions/chatActions';

const Header = ({ username, onToggleModalVisibility, closePicker }) => {
  const [mobileUsersOpen, setMobileUsersOpen] = useState(false);

  return (
    <header onClick={closePicker}>
      <div className="sidebar-header">
        <Logo />
        <div className="sidebar-actions-top">
          <Info />
          <Settings />
          {/* Mobile toggle */}
          <button
            className="sidebar-icon-btn users-icon"
            onClick={(e) => { e.stopPropagation(); setMobileUsersOpen(v => !v); }}
            title="Members">
            <FiUsers size={17} />
          </button>
        </div>
      </div>

      <div className={`sidebar-section${mobileUsersOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-section-label">
          Members
        </div>
        <UserList
          username={username}
          displayUserList={true}
          onToggleModalVisibility={onToggleModalVisibility} />
      </div>
    </header>
  );
};

Header.propTypes = {
  username: PropTypes.string.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired,
};

export default connect(null, { closePicker })(Header);
