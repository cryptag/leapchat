import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FaInfoCircle from 'react-icons/lib/fa/info-circle';

export default class Info extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <div className="info">
        <FaInfoCircle onClick={this.props.onToggleInfoModal} size={25}/>
      </div>
    );
  }
}

Info.propTypes = {
  onToggleInfoModal: PropTypes.func.isRequired
};
