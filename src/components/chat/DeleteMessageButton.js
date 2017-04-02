import React, { Component } from 'react';

class DeleteMessageButton extends Component {
  constructor(props){
    super(props);

    this.onDeleteMessage = this.onDeleteMessage.bind(this);
  }

  onDeleteMessage(e){
    let deleteLink = $(e.target).parent('a');
    let messageKey = deleteLink.data('message-key');

    let messageContainer = deleteLink.parent('li');

    if (confirm('delete this message?')){
      this.props.onDeleteMessage(messageKey);
    } else {
      // no-op
    }
  }

  render(){
    let { message } = this.props;
    return (
      <a href="#" onClick={this.onDeleteMessage} data-message-key={message.key} className="delete-message">
        <i className="fa fa-window-close"></i>
      </a>
    )
  }
}

export default DeleteMessageButton;