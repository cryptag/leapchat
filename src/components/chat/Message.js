import React from 'react';
import emoji from '../../utils/emoji_convertor';
import md from '../../utils/link_attr_blank';
import { getAvatarColor } from './UserStatusIcons';

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
};

const renderContent = (msg) => {
  const emojified = emoji.replace_colons(msg);
  const emojiMD = emojified.replace(
    /<span class="emoji emoji-sizer" style="background-image:url\((\/static\/img\/emoji\/apple\/64\/)(.*?)(\.png)\)" data-codepoints="(?:.*?)"><\/span>/g,
    (match, $1, $2, $3) => {
      let emojiName = 'emoji';
      const parts = $2.split('-');
      for (let i = parts.length; i > 0; i--) {
        const arr = emoji.data[parts.slice(0, i).join('-')];
        if (arr) { emojiName = (arr[3] || [emojiName])[0]; break; }
      }
      return `![:${emojiName}:](${$1}${$2}${$3})`;
    }
  );
  return md.render(emojiMD);
};

const Message = ({ message, username, isGroupStart }) => {
  const isMe = message.from === username;
  const initial = (message.from || '?')[0].toUpperCase();
  const color = getAvatarColor(message.from);
  const html = renderContent(message.msg);

  return (
    <div className={`message-item${isGroupStart ? ' group-start' : ''}`}>
      {isGroupStart
        ? <div className="msg-avatar" style={{ backgroundColor: color }}>{initial}</div>
        : <div className="msg-avatar-spacer" />
      }
      <div className="msg-content">
        {isGroupStart && (
          <div className="msg-header">
            <span className={`msg-username${isMe ? ' is-me' : ''}`}>{message.from}</span>
            {message.ts && <span className="msg-timestamp">{formatTime(message.ts)}</span>}
          </div>
        )}
        <div className="msg-body" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};

export default Message;
