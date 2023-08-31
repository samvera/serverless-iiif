const functionTags = {
  '!GetAtt': { type: 'string', quoted: false },
  '!Sub': { type: 'string', quoted: true },
  '!Ref': { type: 'string', quoted: false },
  '!Split': { type: 'array', quoted: false }
};

module.exports = Object.entries(functionTags).map(([tag, { quoted }]) => {
  const key = tag === '!Ref' ? 'Ref' : tag.replace(/^!/, 'Fn::');
  return {
    tag,
    identify: (val) => {
      const isTagged = Object.keys(val)[0] === key;
      return isTagged;
    },
    resolve: (val) => {
      return { [key]: val };
    },
    stringify: (val) => {
      const result = val.value[key];
      return quoted ? `"${result}"` : result;
    }
  };
});
