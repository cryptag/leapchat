import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { UserStatusIcon } from './UserStatusIcons';

class UserList extends Component {
  constructor(props) {
    super(props);
  }

  styleUserList = () => {
    if (this.props.displayUserList) {
      return { display: 'block' };
    } else {
      return { display: 'none' };
    }
  }

  sortByFrom(username1, username2) {
    return username1.toLowerCase().localeCompare(username2.toLowerCase());
  }

  render() {
    const { statuses, onToggleModalVisibility } = this.props;
    const currentUsername = this.props.username;

    const userStatuses = Object.keys(statuses).map(username => {
      const status = statuses[username];
      return { status, username };
    });

    return (
      <div className="users-list">
        <ul style={this.styleUserList()}>
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
      </div>
    );
  }
}

UserList.propTypes = {
  username: PropTypes.string.isRequired,
  statuses: PropTypes.object.isRequired,
  displayUserList: PropTypes.bool.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired
};

export default UserList;
