import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class MessageForm extends Component {
  constructor(props){
    super(props);

    this.onSendMessage = this.onSendMessage.bind(this);
  }

  componentDidMount(){
    ReactDOM.findDOMNode(this.refs.messageBox).focus();
  }

  onSendMessage(e){
    e.preventDefault();

    // this approach is only marginally less shitty than
    // passing the value up the component tree on each keystroke.
    let messageBox = ReactDOM.findDOMNode(this.refs.messageBox);
    let message = messageBox.value;
    if (message && message.length > 0){
      this.props.onSendMessage(message);
      messageBox.value = '';
    }
  }

  render(){
    return (
      <div className="row message-form">
        <hr />
        <form role="form" className="form" onSubmit={this.onSendMessage}>
          <div className="col-md-12">
            <input type="text" className="form-control" name="message" ref="messageBox" placeholder="Whatcha wanna say?" />
          </div>
        </form>
      </div>
    );
  }
}

export default MessageForm;
