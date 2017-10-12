import React from 'react';
import { connect } from 'react-redux';
import { addSuggestion } from '../../actions/chatActions';
import emoji from '../../utils/emoji_convertor';
import md from '../../utils/link_attr_blank';
import { scrollIntoViewOptions } from '../../utils/suggestions';

const EmojiSuggestions = ({ addSuggestion, chat }) => (
    <ul>
      {chat.suggestions.map((emoj, i) => {
        const suggestion = emoji.replace_colons(emoj.name) + emoj.name;
        const suggestionMD = suggestion.replace(/<span class="emoji emoji-sizer" style="background-image:url\((\/static\/img\/emoji\/apple\/64\/.*?)\)" data-codepoints="(?:.*?)"><\/span>/g, '![emoji]($1)');
        const renderItem = md.renderInline(suggestionMD);
        const activeItem = chat.highlightedSuggestion === i;
        let props = {
          key : i,
          onClick : (e) => addSuggestion(emoj.name),
          className : activeItem ? 'active': '',
        }
        if (activeItem) {
          props.ref = (item) => {
            if (item) item.scrollIntoView(scrollIntoViewOptions);
          }
        }
        return (<li {...props} dangerouslySetInnerHTML={{__html: renderItem}}></li>)
      })}
    </ul>
);



export default connect(({ chat }) => ({chat}), { addSuggestion })(EmojiSuggestions);
