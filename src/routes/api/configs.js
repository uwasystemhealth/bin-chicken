const app = require('../../../app');
const { Config } = app.models;

module.exports = {
    async find(req, res) {
        let configs = await Config.find().whereValid();
        configs.forEach(config => config.perm = config.getPerm(res.locals.user));
        res.json(config);
    },
    async get(req, res) {
        let config = req.params.confId ? await Config.findById(req.params.confId) : null;
        if(!config) throw new app.errors.ConfigNotFound();
        config.perm = config.getPerm(res.locals.user);
        res.json(config);
    },
    async create(req, res) {
        let { body } = req;
        const config = new Config(body);
        config.owner = res.locals.user._id;
        await config.save();
        res.json(config);
    },
    async patch(req, res) {
        let { body } = req;
        let config = req.params.confId ? await Config.findById(req.params.confId) : null;
        if(!config) throw new app.errors.ConfigNotFound();
        const perm = config.getPerm(res.locals.user);
        if(perm === 'none') throw new app.errors.NoPerm();
        if(perm === 'collab' && (body.collabs || body.owner)) throw new app.errors.NoPerm();
        const keys = ['type', 'idiotProof', 'aliases', 'leDomain', 'leUpgrade', 'host', 'port', 'redirect', 'permanent', 'preserve', 'owner', 'collabs'];
        keys.forEach(i => config[i] = body[i] || config[i]);
        await config.save();
        res.json(config);
    },
    async delete(req, res) {
        let config = req.params.confId ? await Config.findById(req.params.confId) : null;
        if(!config) throw new app.errors.ConfigNotFound();
        if(config.getPerm(res.locals.user) !== 'admin') throw new app.errors.NoPerm();
        await config.safeRemove();
        res.json(config);
    },
    async render(req, res) {
        let data = req.params.confId ? await Config.findById(req.params.confId) : req.body;
        if(!data || ['render', 'proxy'].indexOf(data.type) !== -1) throw new app.errors.ConfigNotFound();
        res.locals = { ...res.locals, ...data };
        res.render(`config.templates/${data.type}`);
    },
};
