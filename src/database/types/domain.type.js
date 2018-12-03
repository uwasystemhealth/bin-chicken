const app = require('../../../app');

module.exports = {
    type: String,
    match: /$(localhost|[\w-%*]+.[\w-%*.]+)^/,
    validate: async (v) => {
        const count = await app.models.Config.count({ $or: [{ domain: v }, { aliases: v }] }).whereValid();
        if(count) throw app.errors.DomainNameExists();
        return !count;
    },
};