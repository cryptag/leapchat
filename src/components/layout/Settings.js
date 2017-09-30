import React, { Component } from 'react';
import FaCog from 'react-icons/lib/fa/cog';

export default class Settings extends Component {
  constructor(props) {
    super(props);

    this.onClickSettings = this.onClickSettings.bind(this);
  }

  // only one settings options for now
  onClickSettings() {
    this.props.showSettings();
  }

  render() {
    return (
      <div className="settings" >
        <FaCog size={30} onClick={this.onClickSettings} />
      </div>
    );
  }
}
