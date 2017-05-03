import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const throbberDotStyles = {
  'margin': '10px',
  'height': '20px',
  'width': '20px',
  'borderRadius': '10px',
  'backgroundColor': '#999',
  'float': 'left',
  'transform': 'scale(0.7)'
}


class Throbber extends Component {
  componentDidMount(){

    this.animateLoadingDots();

  }

  // this is messy, just a test animating react elements
  // by their ref directly.
  animateLoadingDots(){
    let keyframes = [
      { 'transform': 'scale(0.7)' },
      { 'transform': 'scale(1.0)' },
      { 'transform': 'scale(0.7)' },
    ];

    let properties = {
      duration: 1000,
      iterations: Infinity
    };

    let firstDot = ReactDOM.findDOMNode(this.refs.firstDot);
    firstDot.animate(keyframes, properties);

    properties['delay'] = 200;

    let secondDot = ReactDOM.findDOMNode(this.refs.secondDot);
    secondDot.animate(keyframes, properties);

    properties['delay'] = 400;

    let thirdDot = ReactDOM.findDOMNode(this.refs.thirdDot);
    thirdDot.animate(keyframes, properties);
  }

  render(){
    return (
      <div className="row">
        <div className="col-md-12 throbber" title="Your content is loading...">
          <div style={throbberDotStyles} ref="firstDot"></div>
          <div style={throbberDotStyles} ref="secondDot"></div>
          <div style={throbberDotStyles} ref="thirdDot"></div>
        </div>
      </div>
    )
  }
}

export default Throbber;
