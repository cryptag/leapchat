import React from 'react';
import { connect } from 'react-redux';
import { addSuggestion } from '../../store/actions/chatActions';
import { scrollIntoViewOptions } from '../../utils/suggestions';
import { UserStatusIconBubble } from './UserStatusIcons';
const MentionSuggestions = ({ chat, addSuggestion }) => (
  <ul>
    {chat.suggestions.map((user, i) => {
      const activeItem = chat.highlightedSuggestion === i;
      const mention = user.name;

      let props = {
        key : i,
        onClick : (e) => addSuggestion(mention),
        className : activeItem ? 'active': '',
      };
      if (activeItem) {
        props.ref = (item) => {
          if (item) item.scrollIntoView(scrollIntoViewOptions);
        };
      }
      return <li {...props}>
        <UserStatusIconBubble status={user.status} />
        {mention.slice(1)}
      </li>;
    })}
  </ul>
);

export default connect(({ chat }) => ({chat}), { addSuggestion })(MentionSuggestions);
