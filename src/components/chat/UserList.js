import React, { Component } from 'react';
import { connect } from 'react-redux';
import FaGroup from 'react-icons/lib/fa/group';
import FaCircle from 'react-icons/lib/fa/circle';
import FaMinusCircle from 'react-icons/lib/fa/minus-circle';

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
    const { statuses } = this.props;

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
                <FaCircle style={styleViewing} />
                {username}
              </li>
            )
          })}

          {online.map((username, i) => {
            return (
              <li key={i}>
                <FaCircle style={styleOnline} />
                {username}
              </li>
            )
          })}

          {offline.map((username, i) => {
            return (
              <li key={i} style={styleOffline}>
                <FaMinusCircle />
                {username}
              </li>
            )
          })}
        </ul>
      </div>
    );
  }
}

const styleDots = {
  marginRight: '.2em',
  marginTop: '.2em'
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

export default UserList;
