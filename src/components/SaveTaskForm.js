import React, { Component } from 'react';

const request = require('superagent');
const cryptagdPrefix = require('superagent-prefix')('http://localhost:7878/trusted');
const utf8 = require('utf8');

export default class SaveTaskForm extends Component {
  render(){
    return (
      <form role="form" className="form" onSubmit={this.props.saveTask}>

        <div className="row col-sm-3">
          <input className="form-control" type="text" placeholder="Title" onChange={this.props.onChangeSaveTitle} />
        </div>

        <div className="row col-sm-3">
          <input className="form-control" type="text" placeholder="Description (optional)" onChange={this.props.onChangeSaveDescription} />
        </div>

        <div className="row col-sm-2">
          <input className="form-control" type="text" placeholder="Assignees (optional)" onChange={this.props.onChangeSaveAssignees} />
        </div>

        <div className="row col-sm-3">
          <input className="form-control" type="text" placeholder="Tags (optional)" onChange={this.props.onChangeSaveTags} />
        </div>

        <div className="row">
          <div className="col-sm-1">
            <button className="btn btn-primary">Save Task</button>
          </div>
        </div>
        <br />

        <div className="col-sm-10">
          {this.props.saveTaskFormMessage}
        </div>
        <br />

      </form>
    )
  }
}
