const Pokemon = require('./pokemon.model');

exports.get = async (params) => {
  const pokemon = new Pokemon(params);
  await pokemon.fetch();

  return pokemon;
};
