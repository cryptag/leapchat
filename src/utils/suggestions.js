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
      begin.push({name: suggestion.colons});
    } else {
      end.push({name: suggestion.colons});
    }
  }
  begin.sort(sortBySuggest);
  end.sort(sortBySuggest);
  return begin.concat(end);
}

export const mentionSuggestions = (start, value, obj) => {
  const users = Object.keys(obj);
  const lowerCaseVal = value.slice( start + 1).toLowerCase();
  let filteredMentions = [];
  users.forEach((user) => {
    const lowerCaseUser = user.toLowerCase();
    if(lowerCaseUser.startsWith(lowerCaseVal)) {
      filteredMentions.push({name: '@' + user, status: obj[user]});
    }
  });
  return filteredMentions.sort(sortBySuggest);
}

const sortBySuggest = (suggest1, suggest2) => {
  return suggest1.name.localeCompare(suggest2.name);
}

export const scrollIntoViewOptions = {behavior: 'instant', block: 'nearest'};
if (window.browser === 'Firefox') {
  delete(scrollIntoViewOptions.block);
}
