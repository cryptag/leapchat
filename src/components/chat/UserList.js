import React, { Component } from 'react';
import FaGroup from 'react-icons/lib/fa/group';
import FaCircle from 'react-icons/lib/fa/circle';
import FaMinusCircle from 'react-icons/lib/fa/minus-circle';
import $ from 'jquery';

export default class UserList extends Component {
  constructor(props) {
    super(props);

    this.onClickUsersIcon = this.onClickUsersIcon.bind(this);
  }

  // TODO: if mobile make this do nothing
  onClickUsersIcon() {
    $(this.refs.menuList).slideToggle('fast');
  }

  sortByFrom(status1, status2) {
    return status1.from.toLowerCase().localeCompare(status2.from.toLowerCase());
  }

  render() {
    let statuses = this.props.statuses;

    let viewing = [];  // green
    let online = [];   // yellow
    let offline = [];  // gray

    let usernamesSeen = [];

    for (let i = statuses.length - 1; i >= 0; i--) {
      let status = statuses[i];

      // Avoid showing a user's status twice
      if (usernamesSeen.indexOf(status.from) !== -1) {
        continue;
      }
      switch (status.status) {
      case 'viewing':
        viewing.push(status);
        break;
      case 'online':
        online.push(status);
        break;
      case 'offline':
        offline.push(status);
        break;
      }
      console.log('Already seen', status.from);
      usernamesSeen.push(status.from);
    }

    viewing.sort(this.sortByFrom);
    online.sort(this.sortByFrom);
    offline.sort(this.sortByFrom);

    console.log('Updating presence/all user statuses:', viewing, online, offline);

    return (
      <div className="users-list">
        <div className="users-icon" onClick={this.onClickUsersIcon}>
          <FaGroup size={30} />
        </div>
        <ul ref="menuList">
          {viewing.map(status => {
            return (
              <li key={status.key}>
                <FaCircle style={styleViewing} />
                {status.from}
              </li>
            )
          })}

          {online.map(status => {
            return (
              <li key={status.key}>
                <FaCircle style={styleOnline} />
                {status.from}
              </li>
            )
          })}

          {offline.map(status => {
            return (
              <li key={status.key} style={styleOffline}>
                <FaMinusCircle />
                {status.from}
              </li>
            )
          })}
        </ul>
      </div>
    );
  }
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
