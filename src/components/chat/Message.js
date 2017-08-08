import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import { EmojiConvertor } from 'emoji-js';

const emoji = new EmojiConvertor();

function LinkRenderer(props) {
  return <a href={props.href} target="_blank">{props.children}</a>
}

class Message extends Component {
  render(){
    let { message, username } = this.props;
    let fromMe = message.from === username;
    let messageClass = fromMe ? 'chat-outgoing' : 'chat-incoming';
    let spaced = message.msg.replace(/:(\w+):/g, ':$1: ');
    let emojified = emoji.replace_colons(spaced);

    return (
      <li className={messageClass} key={message.key}>
        <span className="username">{message.from}</span>
        <ReactMarkdown
          source={emojified}
          renderers={{Link: LinkRenderer}}
          escapeHtml={true} />
      </li>
    );
  }
}

export default Message;
