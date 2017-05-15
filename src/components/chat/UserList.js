import React, { Component } from 'react';

export default class UserList extends Component {
  constructor(props) {
    super(props);

    this.onClickUsersIcon = this.onClickUsersIcon.bind(this);
  }

  // TODO: if mobile make this do nothing
  onClickUsersIcon(){
  	$(this.refs.menuList).slideToggle();
  }


  render() {
    return (
      <div className="users-list">
      	<div className="users-icon" onClick={this.onClickUsersIcon}>
          <i className="fa fa-users fa-2x"></i>
        </div>
        <ul>
          <li>
            <i className="fa fa-circle"></i>
            elimisteve
          </li>
          <li>
            <i className="fa fa-minus-circle"></i>
            EnlargedProstate
          </li>
        </ul>
      </div>
    );
  }
}
