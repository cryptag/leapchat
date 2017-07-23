import React, { Component } from 'react';
import FaInfoCircle from 'react-icons/lib/fa/info-circle'

export default class Info extends Component {
  constructor(props){
    super(props)
  }

  render() {
    return (
      <div className="info">
          <FaInfoCircle onClick={this.props.toggleInfoModal} size={18}/>
      </div>
    );
  }
}
