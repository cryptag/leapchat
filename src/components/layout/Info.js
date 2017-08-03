import React, { Component } from 'react';
import FaQuestionCircle from 'react-icons/lib/fa/question-circle'

export default class Info extends Component {
  constructor(props){
    super(props)
  }

  render() {
    return (
      <div className="info">
          <FaQuestionCircle onClick={this.props.toggleInfoModal} size={19}/>
      </div>
    );
  }
}
