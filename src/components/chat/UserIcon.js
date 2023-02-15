import React, { Component } from 'react';
import PropTypes from 'prop-types';

import FaGroup from 'react-icons/lib/fa/group';

class UserIcon extends Component {

  render() {
    return (
      <div className="users-icon">
        <FaGroup size={30} onClick={this.props.onToggleUserList} />
      </div>
    );
  }
}

UserIcon.propTypes = {
  onToggleUserList: PropTypes.func.isRequired
};

export default UserIcon;
