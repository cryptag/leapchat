import React, { Component } from 'react';

export default class Settings extends Component {
  constructor(props) {
    super(props);

    this.onClickSettings = this.onClickSettings.bind(this);
  }

  // only one settings options for now
  onClickSettings(){
    this.props.promptForUsername();
  }

  render() {
    return (
      <div className="settings" onClick={this.onClickSettings}>
        <i className="fa fa-cog fa-2x"></i>
      </div>
    );
  }
}
