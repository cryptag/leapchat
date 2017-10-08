import React from 'react';
import { connect } from 'react-redux';
import { addSuggestion } from '../../actions/chatActions';
import emoji from '../../utils/emoji_convertor';
import md from '../../utils/link_attr_blank';

const AutoSuggest = ({ addSuggestion, chat }) => {

  const list = (
    <ul>
      {chat.suggestions.map((emoj, i) => {
        const suggestion = emoji.replace_colons(emoj.colons) + emoj.colons;
        const suggestionMD = suggestion.replace(/<span class="emoji emoji-sizer" style="background-image:url\((\/static\/img\/emoji\/apple\/64\/.*?)\)" data-codepoints="(?:.*?)"><\/span>/g, '![emoji]($1)');
        const renderItem = md.renderInline(suggestionMD);
        const activeItem = chat.highlightedSuggestion === i;
        let props = {
          key : i,
          onClick : (e) => addSuggestion(emoj.colons),
          className : activeItem ? 'active': '',
        }
        if (activeItem) {
          props.ref = (item) => {
            if (item) item.scrollIntoView({behavior: 'instant', block: 'nearest'});
          }
        }
        return (<li {...props} dangerouslySetInnerHTML={{__html: renderItem}}></li>)
      })}
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
