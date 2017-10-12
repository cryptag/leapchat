import { EmojiConvertor } from 'emoji-js';
import { EMOJI_APPLE_64_PATH, EMOJI_APPLE_64_SHEET } from '../constants/emoji';

const emoji = new EmojiConvertor();

emoji.allow_native = false;
emoji.img_sets.apple.path = '/' + EMOJI_APPLE_64_PATH;
emoji.img_sets.apple.sheet = '/' + EMOJI_APPLE_64_SHEET;

export default emoji;
