const utf8 = require('utf8');
const atob = require('atob');
const btoa = require('btoa');

export function tagByPrefix(plaintags, ...prefixes) {
  let prefix = '';
  for (let i = 0; i < prefixes.length; i++) {
    prefix = prefixes[i];
    for (let j = 0; j < plaintags.length; j++) {
      if (plaintags[j].startsWith(prefix)) {
        return plaintags[j];
      }
    }
  }
  return '';
}

export function tagByPrefixStripped(plaintags, ...prefixes) {
  let tag = '';
  for (let i = 0; i < prefixes.length; i++) {
    tag = tagByPrefix(plaintags, prefixes[i]);
    if (tag !== '') {
      return tag.slice(prefixes[i].length);
    }
  }

  return '';
}

export function tagsByPrefixStripped(plaintags, prefix) {
  let stripped = [];
  for (let i = 0; i < plaintags.length; i++) {
    if (plaintags[i].startsWith(prefix)) {
      // Strip off prefix
      stripped.push(plaintags[i].slice(prefix.length));
    }
  }
  return stripped;
}

export function sortRowByCreated(row, nextRow){
  let date = tagByPrefix(row.tags || row.plaintags, 'created:');
  let next = tagByPrefix(nextRow.tags || nextRow.plaintags, 'created:');

  return date.localeCompare(next);
}

export function parseJSON(str){
  return JSON.parse(utf8.decode(atob(str.unencrypted)));
}

export function encodeObjForPost(obj){
  return btoa(utf8.encode(JSON.stringify(obj)));
}

export function cleanedFields(s){
  let fields = s.trim().replace(',', ' ').split(/\s+/g);
  return fields.filter(f => f !== '');
}
