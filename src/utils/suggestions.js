import { emojiIndex } from 'emoji-mart';

export const filterSuggestions = (cursorStart, value) => {
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

const sortBySuggestColons = (suggest1, suggest2) => {
  return suggest1.colons.localeCompare(suggest2.colons);
}
