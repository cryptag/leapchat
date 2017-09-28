import React from 'react';
import { connect } from 'react-redux';
import { addSuggestion } from '../../actions/chatActions';

const AutoSuggest = ({ addSuggestion, chat }) => {

  const list = (
    <ul>
      {chat.suggestions.map((emoji, i) =>
        <li key={i} onClick={(e) => addSuggestion(emoji.colons)} className={chat.highlightedSuggestion === i ? 'active': ''}>
          {emoji.native} {emoji.colons}
        </li>
      )}
    </ul>
  );

  return (
    <div className="suggestions-container">
      <div className="suggestions-header">
        Emoji matching <strong>"{chat.suggestionWord}"</strong>
        <span className="header-help">
	  	    <strong>↑</strong><strong>↓ </strong> to navigate
  	  		<span className="inline-margin"><strong> ↵ </strong> to select</span>
        </span>
      </div>
      {list}
    </div>
  )
}


export default connect(({ chat }) => ({chat}), { addSuggestion })(AutoSuggest);
