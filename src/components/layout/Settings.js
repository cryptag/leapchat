import React, { Component } from 'react';
import FaCog from 'react-icons/lib/fa/cog';

export default class Settings extends Component {
  constructor(props) {
    super(props);

    this.onClickSettings = this.onClickSettings.bind(this);
  }

  // only one settings options for now
  onClickSettings() {
    this.props.promptForUsername();
  }

  render() {
    return (
      <div className="settings" onClick={this.onClickSettings}>
        <FaCog size={30} />
      </div>
    );
  }
}
