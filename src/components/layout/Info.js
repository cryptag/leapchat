import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FaQuestionCircle from 'react-icons/lib/fa/question-circle'

export default class Info extends Component {
  constructor(props){
    super(props)
  }

  render() {
    return (
      <div className="info">
        <FaQuestionCircle onClick={this.props.onToggleInfoModal} size={19}/>
      </div>
    );
  }
}

Info.propTypes = {
  onToggleInfoModal: PropTypes.func.isRequired
}
