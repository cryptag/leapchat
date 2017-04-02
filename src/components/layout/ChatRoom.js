import React, { Component } from 'react';

class ChatRoom extends Component {
  render(){
    let username = this.props.username;
    let rooms = this.props.rooms;

    return (
     <div key={this.props.room.key} className="chatroom">
        {(this.props.room.messages || []).map(message => {
          let fromMe = (message.from === username);
          return (
            <div key={message.key} className={fromMe ? 'chat-outgoing' : 'chat-incoming'}>
              {message.from}: {message.msg}
            </div>
          )
        })}
      </div>
    )
  }
}

export default ChatRoom;
