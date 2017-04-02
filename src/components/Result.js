import React, { Component } from 'react';

export default class Result extends Component {
  constructor(props){
    super(props);
  }

  render(){
    let result = this.props.result;
    return (
      <tr>
        <td>{result.title}</td>
        <td>{result.description.split("\n").map( (line) => {
          return (
            <span>
              {line}
              <br />
            </span>
          )
        })}</td>
        <td>{result.assignees.join(", ")}</td>
        <td>{result.tags.join(", ")}</td>
      </tr>
    );
  }
}
