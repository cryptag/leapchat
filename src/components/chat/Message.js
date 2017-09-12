import React, { Component } from 'react';
import { formatRelative } from 'date-fns';

import emoji from '../../utils/emoji_convertor';
import md from '../../utils/link_attr_blank';

class Message extends Component {
  render(){
    let { message, username } = this.props;
    let fromMe = message.from === username;
    let messageClass = fromMe ? 'chat-outgoing' : 'chat-incoming';
    
    let RFCDate = message.key.split('-')[0];
    let date = formatRelative(Date.parse(RFCDate), new Date());

    let emojified = emoji.replace_colons(message.msg);

    // Convert `emoji.replace_colons`-generated <span> tags to Markdown
    let emojiMD = emojified.replace(
      /<span class="emoji emoji-sizer" style="background-image:url\((\/static\/img\/emoji\/apple\/64\/)(.*?)(\.png)\)" data-codepoints="(?:.*?)"><\/span>/g,
      (match, $1, $2, $3) => {
        // Example:
        //
        // $1 == /static/img/emoji/apple/64/
        // $2 == 1f604
        // $3 == .png
        // emoji.data[$2][3][0] == smile
        // return '![:smile:](/static/img/emoji/apple/64/1f604.png)'
        const twoSimple = ($2).split('-')[0];
        return '![:' + emoji.data[twoSimple][3][0] + ':](' + $1 + $2 + $3 + ')';
      }
    )

    // Render escaped HTML/Markdown
    let linked = md.render(emojiMD);

    return (
      <li className={'chat-message ' + messageClass} key={message.key}>
        <div className="message-header">
          <span className="username">{message.from}</span>
          <span className="message-timestamp">{date}</span>
        </div>
        <div dangerouslySetInnerHTML={{__html: linked}}>
        </div>
      </li>
    );
  }
}

export default Message;
