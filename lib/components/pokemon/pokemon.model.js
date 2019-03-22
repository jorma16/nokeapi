const axios = require('axios');
const camelcase = require('camelcase');
const config = require('../../config');

class PokeError extends Error {
  constructor(error) {
    super(error.message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    if (error.response) {
      this.response = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      };
    }
  }
}

class Pokemon {
  constructor(params) {
    Object.entries(params).forEach(([key, value]) => {
      this[`_${key}`] = value;
    });

    this._url = config.url;
  }

  set(raw, attrs) {
    attrs.forEach((attr) => {
      this[`_${camelcase(attr)}`] = raw[attr];
    });
  }

  async _extractAreaEncounters(url) {
    const { data } = await axios.get(url);
    this._locations = [];
    data.forEach((location) => {
      this._locations.push({ name: location.location_area.name });
    });

    return this;
  }

  _extractTypes(types) {
    const ts = types.map(({ slot, type }) => ({ order: slot, name: type.name }));
    this._type = ts.sort((a, b) => a.order > b.order).map((t) => t.name);

    return this;
  }

  _extractMoves(moves) {
    return this;
  }

  async fetch() {
    try {
      const { data } = await axios.get(`${this._url}/pokemon/${this._id || this._name}`);
      this.set(data, ['base_experience', 'height', 'name', 'id', 'order', 'weight', 'sprites']);
      await this._extractAreaEncounters(data.location_area_encounters);
      this._extractTypes(data.types);
      this._extractMoves(data.moves);

      return this;
    } catch (error) {
      throw new PokeError(error);
    }
  }

  getDefaultSprite(params = { perspective: 'front', type: 'default' }) {
    const sprite = Object.entries(this._sprites).find(([key, url]) => `${params.perspective}_${params.type}` === key);

    if (!sprite) {
      return;
    }

    const [, url] = sprite;

    return url;
  }

  toObject() {
    const privateAttrs = ['_url'];
    return Object.entries(this).reduce((obj, [attr, value]) => {
      if (privateAttrs.includes(attr)) {
        return obj;
      }

      obj[attr.replace('_', '')] = value;

      return obj;
    }, {});
  }
}

module.exports = Pokemon;
