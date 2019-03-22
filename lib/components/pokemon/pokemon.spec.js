const test = require('ava');
const lib = require('./index'); // eslint-disable-line unicorn/import-index

test('get returns a pokemon', async (t) => {
  const pokemon = await lib.get({ name: 'pidgey' });
  const sprite = pokemon.getDefaultSprite({ perspective: 'back', type: 'shiny' });
});
