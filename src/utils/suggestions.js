import { emojiIndex } from 'emoji-mart';

export const emojiSuggestions = (cursorStart, value) => {
  const input = value.slice(cursorStart + 1);
  const emojiSuggestions =  emojiIndex.search(input) || [];
  const begin = [];
  const end = [];
  const colonInput = ":" + input;
  let suggestion;
  for (var i = 0; i < emojiSuggestions.length; i++) {
    suggestion = emojiSuggestions[i];
    if (suggestion.colons.startsWith(colonInput)) {
      begin.push(suggestion);
    } else {
      end.push(suggestion);
    }
  }
  begin.sort(sortBySuggestColons);
  end.sort(sortBySuggestColons);
  return begin.concat(end);
}

export const mentionSuggestions = (start, value, obj) => {
  const users = Object.keys(obj);
  const upperCaseVal = value.slice( start + 1).toUpperCase();
  let filteredMentions = [];
  users.forEach((user) => {
    const upperCaseUser = user.toUpperCase();
    if(upperCaseUser.startsWith(upperCaseVal)) {
      filteredMentions.push({name: user, status: obj[user]});
    }
  });
  return filteredMentions;
}

const sortBySuggestColons = (suggest1, suggest2) => {
  return suggest1.colons.localeCompare(suggest2.colons);
}
