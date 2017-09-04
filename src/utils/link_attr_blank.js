const md = require('markdown-it')({
  html: false,
  linkify: true,
  typographer: false
});

const assignAttributes = (tokens, idx, attrObj) => {
  Object.keys(attrObj).forEach((attr) => {
    const aIndex = tokens[idx].attrIndex(attr);
    if (aIndex < 0) {
      tokens[idx].attrPush([attr, attrObj[attr]]); // add new attribute
    } else {
      tokens[idx].attrs[aIndex][1] = attrObj[attr]; // replace value of existing attr
    }
  });
}
const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  assignAttributes(tokens, idx, {
    target: '_blank',
    rel: 'nofollow noreferrer noopener'
   });
  // pass token to default renderer.
  return defaultRender(tokens, idx, options, env, self);
};

export default md;
