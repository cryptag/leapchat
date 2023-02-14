import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  ViewingUserIcon,
  OnlineUserIcon,
  OfflineUserIcon
} from './UserStatusIcons'

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
    const { statuses, onShowUsernameModal } = this.props;
    const currentUsername = this.props.username;

    const viewing = [];  // green
    const online = [];   // yellow
    const offline = [];  // gray

    Object.keys(statuses).forEach(username => {
      const status = statuses[username];
      switch (status) {
      case 'viewing':
        viewing.push(username);
        break;
      case 'online':
        online.push(username);
        break;
      case 'offline':
        offline.push(username);
        break;
      }
    });

    viewing.sort(this.sortByFrom);
    online.sort(this.sortByFrom);
    offline.sort(this.sortByFrom);

    return (
      <div className="users-list">
        <ul style={this.styleUserList()}>
          {viewing.map((username, i) => {
            return (
              <li key={i}>
                <ViewingUserIcon
                  username={username}
                  isCurrentUser={username === currentUsername}
                  onShowUsernameModal={onShowUsernameModal} />
              </li>
            )
          })}

          {online.map((username, i) => {
            return (
              <li key={i}>
                <OnlineUserIcon />
                {username}
              </li>
            )
          })}

          {offline.map((username, i) => {
            return (
              <li key={i}>
                <OfflineUserIcon />
                {username}
              </li>
            )
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
  onShowUsernameModal: PropTypes.func.isRequired
}

export default UserList;
