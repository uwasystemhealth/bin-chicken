const app = require('../../../app');
const testConfig = require('../../lib/testConfig');

const Config = app.models.config;

module.exports = {
  async find(req, res) {
    const configs = await Config.find().whereValid();
    res.json(configs.map(config => ({ ...config._doc, perm: config.getPerm(res.locals.user) })));
  },
  async get(req, res) {
    const config = req.params.confId ? await Config.findById(req.params.confId) : null;
    if(!config) throw new app.errors.ConfigNotFound();
    config.perm = config.getPerm(res.locals.user);
    res.json(config);
  },
  async create(req, res) {
    const { body } = req;
    const config = new Config(body);
    // eslint-disable-next-line no-underscore-dangle
    config.owner = res.locals.user._id;
    if(!Array.isArray(config.collabs)) config.collabs = [config.owner];
    if(config.collabs.indexOf(config.owner) === -1) config.collabs.push(config.owner);
    await config.save();
    res.json(config);
  },
  async patch(req, res) {
    const { body } = req;
    const config = req.params.confId ? await Config.findById(req.params.confId) : null;
    if(!config) throw new app.errors.ConfigNotFound();
    const perm = config.getPerm(res.locals.user);
    if(perm === 'none') throw new app.errors.NoPerm();
    if(perm === 'collab' && (body.collabs || body.owner)) throw new app.errors.NoPerm();
    const keys = ['type', 'idiotProof', 'aliases', 'leDomain', 'leUpgrade', 'host', 'port', 'redirect', 'permanent', 'preserve', 'owner', 'collabs'];
    keys.forEach((i) => { config[i] = body[i] || config[i]; });
    await config.save();
    res.json(config);
  },
  async delete(req, res) {
    const config = req.params.confId ? await Config.findById(req.params.confId) : null;
    if(!config) throw new app.errors.ConfigNotFound();
    if(config.getPerm(res.locals.user) !== 'admin') throw new app.errors.NoPerm();
    await config.safeRemove();
    res.json(config);
  },
  async render(req, res) {
    const data = req.method === 'GET' ? await Config.findById(req.params.confId) : req.body;
    if(!data || ['redirect', 'proxy'].indexOf(data.type) === -1) throw new app.errors.ConfigNotFound();
    res.locals = { ...res.locals, ...data };
    res.render('config.template.hbs', { layout: false });
  },
  async test(req, res) {
    const data = req.method === 'GET' ? await Config.findById(req.params.confId) : req.body;
    if(!data || ['redirect', 'proxy'].indexOf(data.type) === -1) throw new app.errors.ConfigNotFound();
    res.send(await testConfig(data));
  },
};
