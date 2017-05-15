import React, { Component } from 'react';

import UserList from '../chat/UserList';
import Logo from './Logo';
import Settings from './Settings';


export default class Header extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return (
      <header>
        <div className="logo-container">
          <Logo />
          <Settings
            promptForUsername={this.props.promptForUsername} />
        </div>
        <UserList />
      </header>
    )
  }
}