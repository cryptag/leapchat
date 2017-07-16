import { nouns, adjectives } from './constants';

function getRandomAdjective(){
  return adjectives[Math.floor(Math.random()*adjectives.length)];
}

function getRandomNoun(){
  return nouns[Math.floor(Math.random()*nouns.length)];
}

export function generateRandomUsername(){
  return getRandomAdjective() + getRandomNoun();
}