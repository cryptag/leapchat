import React, { Component } from 'react';
import { connect } from 'react-redux';
import FaGroup from 'react-icons/lib/fa/group';

class UserIcon extends Component {

  render() {
    return (
      <div className="users-icon">
        <FaGroup size={30} onClick={this.props.toggleUserList} />
      </div>
    );
  }
}

export default UserIcon;
