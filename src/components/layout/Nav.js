import React, { Component } from 'react';

class Nav extends Component {
  render(){
    return (
      <div className="navigation">
        <div className="logo">

          <h1>LeapChat</h1>
        </div>

        <nav>
          <div className="tab">
            <a href="#"><i className="fa fa-2x fa-globe"></i></a>
          </div>
          <div className="tab">
            <a href="#"><i className="fa fa-2x fa-comment-o"></i></a>
          </div>
          <div className="tab">
            <a href="#"><i className="fa fa-2x fa-users"></i></a>
          </div>
          <div className="tab">
            <a href="#"><i className="fa fa-2x fa-cog"></i></a>
          </div>
        </nav>
      </div>
    );
  }
}

export default Nav;
