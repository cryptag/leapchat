import React, { Component } from 'react';

export default class SearchForm extends Component {
  render(){
    return (
      <form role="form" className="form" onSubmit={this.props.executeSearch}>

        <div className="row col-sm-6">
          <input className="form-control search-box" type="text" onChange={this.props.onChangeTagValue} placeholder="enter tags" />
        </div>
        <div className="row">
          <div className="col-sm-2">
            <button className="btn btn-primary">Search</button>
          </div>
        </div>
        <br />
        <div className="col-sm-10">
          {this.props.flashMessage}
        </div>
        <br />

      </form>
    )
  }
}
