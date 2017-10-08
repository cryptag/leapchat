import { emojiIndex } from 'emoji-mart';

export const emojiSuggestions = (start, value) => {
  return emojiIndex.search(value.slice(start + 1));
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
