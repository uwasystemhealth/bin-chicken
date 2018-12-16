const app = require('../../../app');

module.exports = {
  type: String,
  match: [/(^localhost$)|(^(\*\.|[\w-]+\.)+([\w-]+)$)|(^~.+$)/, 'Invalid domain'],
  async validate(v) {
    const count = await app.models.config.countDocuments({
      $or: [{ domain: v }, { aliases: v }],
      ...(this._id ? { _id: { $ne: this._id } } : {}),
    }).whereValid();
    if(count) throw app.errors.DomainNameExists();
    return true;
  },
};
