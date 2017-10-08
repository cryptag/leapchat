import React from 'react';
import { connect } from 'react-redux';
import { addSuggestion } from '../../actions/chatActions';

const MentionSuggestions = ({ chat, addSuggestion }) => (
  <ul>
    {chat.suggestions.map((user, i) => {
      const activeItem = chat.highlightedSuggestion === i;
      const mention = '@' + user.name;
      let props = {
        key : i,
        onClick : (e) => addSuggestion(mention),
        className : activeItem ? 'active': '',
      }
      if (activeItem) {
        props.ref = (item) => {
          if (item) item.scrollIntoView({behavior: 'instant', block: 'nearest'});
        }
      }
      return <li {...props}>{mention}</li>
    })}
  </ul>
)

export default connect(({chat}) => ({ chat }), { addSuggestion })(MentionSuggestions);
