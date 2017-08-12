import React, { Component } from 'react';
import UserIcon from '../chat/UserIcon';
import UserList from '../chat/UserList';
import Logo from './Logo';
import Settings from './Settings';
import Info from './Info';

export default class Header extends Component {
  constructor(props){
    super(props);

    this.state = { displayUserList: false };
  }

  toggleUserList = () => {
    this.setState({ displayUserList: !this.state.displayUserList });
  }

  render(){
    return (
      <header>
        <div className="logo-container">
          <div id="logo-info">
            <Logo />
            <Info toggleInfoModal={this.props.toggleInfoModal}/>
          </div>
          <Settings
            promptForUsername={this.props.promptForUsername} />
        </div>
        <UserIcon toggleUserList={this.toggleUserList} />
        <UserList
          statuses={this.props.statuses}
          displayUserList={this.state.displayUserList} />
      </header>
    )
  }
}
