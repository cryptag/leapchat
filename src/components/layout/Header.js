import React, { Component } from 'react';
import UserIcon from '../chat/UserIcon';
import UserList from '../chat/UserList';
import Logo from './Logo';
import Settings from './Settings';
import Info from './Info';
import { closePicker } from '../../actions/chatActions';
import { connect } from 'react-redux';

class Header extends Component {
  constructor(props){
    super(props);

    this.state = { displayUserList: false };
  }

  toggleUserList = () => {
    this.setState({ displayUserList: !this.state.displayUserList });
  }

  render(){
    const { closePicker, toggleInfoModal, showSettings, statuses } = this.props;
    return (
      <header onClick={closePicker}>
        <div className="logo-container">
          <div id="logo-info">
            <Logo />
            <Info toggleInfoModal={toggleInfoModal}/>
          </div>
          <Settings
            showSettings={showSettings} />
        </div>
        <UserIcon toggleUserList={this.toggleUserList} />
        <UserList
          statuses={statuses}
          displayUserList={this.state.displayUserList} />
      </header>
    )
  }
}

export default connect(null, { closePicker })(Header);
