import React, { Component } from 'react';
import emoji from '../../utils/emoji_convertor';
import md from '../../utils/link_attr_blank';

class Message extends Component {

  render() {
    let { message, username } = this.props;
    let fromMe = message.from === username;
    let messageClass = fromMe ? 'chat-outgoing' : 'chat-incoming';

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
        let emojiName = 'emoji';
        let emojiNameArray = null;

        // Sometimes $2 looks something like 1f604-1f604-1f604-1f604
        const parts = ($2).split('-');
        const partsLength = parts.length;
        for (let i = partsLength; i > 0; i--) {
          emojiNameArray = emoji.data[parts.slice(0, i).join('-')];
          if (emojiNameArray) {
            break;
          }
        }

        if (emojiNameArray &&
            emojiNameArray.length >= 4 &&
            emojiNameArray[3].length >= 1) {

          emojiName = emojiNameArray[3][0];
        }

        return '![:' + emojiName + ':](' + $1 + $2 + $3 + ')';
      }
    )

    // Render escaped HTML/Markdown
    let linked = md.render(emojiMD);

    return (
      <li className={'chat-message ' + messageClass} key={message.key}>
        <span className="username">{message.from}</span>
        <div dangerouslySetInnerHTML={{__html: linked}}>
        </div>
      </li>
    );
  }
}

export default Message;
