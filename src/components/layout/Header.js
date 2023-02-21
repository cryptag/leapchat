import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import UserIcon from '../chat/UserIcon';
import UserList from '../chat/UserList';
import Logo from './Logo';
import Settings from './Settings';
import Info from './Info';
import { closePicker } from '../../actions/chatActions';

class Header extends Component {
  constructor(props){
    super(props);

    this.state = { displayUserList: false };
  }

  onToggleUserList = () => {
    this.setState({ displayUserList: !this.state.displayUserList });
  };

  render(){
    const {
      username,
      statuses,
      onToggleModalVisibility,
      onShowUsernameModal
    } = this.props;
    const { displayUserList } = this.state;
    
    return (
      <header onClick={closePicker}>
        <div className="logo-container">
          <div id="logo-info">
            <Logo />
            <Info onToggleModalVisibility={onToggleModalVisibility}/>
          </div>
          <Settings
            onToggleModalVisibility={onToggleModalVisibility} />
        </div>
        <UserIcon onToggleUserList={this.onToggleUserList} />
        <UserList
          username={username}
          statuses={statuses}
          displayUserList={displayUserList}
          onToggleModalVisibility={onToggleModalVisibility} />
      </header>
    );
  }
}

Header.propTypes = {
  username: PropTypes.string.isRequired,
  statuses: PropTypes.object.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired
};

export default connect(null, { closePicker })(Header);
