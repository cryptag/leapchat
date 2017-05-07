import { expect } from 'chai';

import { tagByPrefix, cleanedFields } from '../../src/utils/tags';

describe('tags', function () {

  describe('#tagByPrefix', function () {
    
    it('returns first plaintag matching any prefix', function () {
      let plaintags = ['chatmessage:hello', 'chatmessage:goodbye'];
      let prefixes = ['invalidtype', 'chatmessage'];
      let result = tagByPrefix(plaintags, ...prefixes);
      expect(result).to.equal(plaintags[0]);

      plaintags = ['invalidtype:something', 'picture:bytes']
      prefixes = ['chatmessage', 'picture'];
      result = tagByPrefix(plaintags, ...prefixes);
      expect(result).to.equal(plaintags[1]);
    });

    it('returns empty string if no plaintag matches', function () {
      let plaintags = ['chatmessage:hello', 'chatmessage:goodbye'];
      let prefixes = ['invalidtype', 'otherinvalidtype'];
      let result = tagByPrefix(plaintags, ...prefixes);
      expect(result).to.equal('');
    });

  });

  describe('#cleanedFields', function () {
    it('converts empty string to empty array', function () {
      let result = cleanedFields('');
      expect(result).to.deep.equal([]);
    });

    it('converts string to array', function () {
      let result = cleanedFields(' hello,there ');
      expect(result).to.deep.equal(['hello', 'there']);
    });

    it('converts string with multi-whitespace separators to array', function () {
      let result = cleanedFields(' hello,    there     world ');
      expect(result).to.deep.equal(['hello', 'there', 'world']);
    });
  });

});
