import React from 'react';
import { connect } from 'react-redux';
import emoji from '../../utils/emoji_convertor';
import md from '../../utils/link_attr_blank';
import MentionSuggestions from './MentionSuggestions';
import EmojiSuggestions from './EmojiSuggestions';

const AutoSuggest = ({ chat }) => {

  const isMentions = chat.suggestionWord[0] === '@';

  return (
    <div className="suggestions-container">
      <div className="suggestions-header">
        { isMentions
          ? 'User'
          :'Emoji'
        } matching <strong>"{chat.suggestionWord}"</strong>
        <span className="header-help">
          <strong>↑</strong><strong>↓ </strong> to navigate
          <span className="inline-margin"><strong> ↵ </strong> to select</span>
        </span>
      </div>
      { isMentions
        ? <MentionSuggestions />
        : <EmojiSuggestions />
      }
    </div>
  )
}


export default connect(({ chat }) => ({chat}))(AutoSuggest);
