import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { chatHandler } from '../../epics/chatEpics';

import TodoListInput from '../right_panel/TodoListInput';


class RightPanel extends Component {
  constructor(props) {
    super(props);

    // So we can create todo lists and tasks without 9 layers of
    // abstraction
    this.getWsConn = chatHandler.getWsConn;
    this.getCryptoInfo = chatHandler.getCryptoInfo;
  }

  render() {
    return (
      <div style={styleRightPanel}>
        <h2>Todo Lists</h2>

        {/* TODO: Iterate over this.props.task.todoLists */}

        <TodoListInput
          chat={this.props.chat}
          task={this.props.task}
          getWsConn={this.getWsConn}
          getCryptoInfo={this.getCryptoInfo}
        />
      </div>
    );
  }
}

const styleRightPanel = {
  padding: '16px',
  width: '30vw',
  minWidth: '300px'
};

export default connect(({ chat, task }) => ({ chat, task }))(RightPanel);
