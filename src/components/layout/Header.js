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
        <Logo />
        <UserList />
        <Settings
          promptForUsername={this.props.promptForUsername} />
      </header>
    )
  }
}