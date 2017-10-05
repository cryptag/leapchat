import { emojiIndex } from 'emoji-mart';

export const filterSuggestions = (start, value) => {
  return emojiIndex.search(value.slice(start + 1));
}
