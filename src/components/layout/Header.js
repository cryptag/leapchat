import React, { Component } from 'react';

import UserList from '../chat/UserList';
import Logo from './Logo';
import Settings from './Settings';
import Info from './Info';

export default class Header extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return (
      <header>
        <div className="logo-container">
          <Logo />
          <Info toggleInfoModal={this.props.toggleInfoModal}/>
          <Settings
            promptForUsername={this.props.promptForUsername} />
        </div>
        <UserList
          statuses={this.props.statuses} />
      </header>
    )
  }
}
