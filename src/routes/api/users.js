const app = require('../../../app');

const User = app.models.user;

module.exports = {
  async find(req, res) {
    res.json(await User.find().whereValid());
  },
  async get(req, res) {
    const user = req.params.userId ? await User.findById(req.params.userId).whereValid() : null;
    if(!user) throw new app.errors.UserNotFound();
    res.json(user);
  },
  async create(req, res) {
    if(!res.locals.user.isAdmin) throw new app.errors.NoPerm();
    const { body } = req;
    if(!body.username || !/$\d{8}^/.test(body.username)) throw new app.errors.UsernameInvalid();
    const count = await User.count({ username: body.username }).whereValid();
    if(count) throw new app.errors.UserExists();
    const user = new User({ username: body.username });
    await user.save();
    res.json(user);
  },
  async patch(req, res) {
    if(!res.locals.user.isAdmin) throw new app.errors.NoPerm();
    const { body } = req;
    const user = req.params.userId ? await User.findById(req.params.userId).whereValid() : null;
    if(!user) throw new app.errors.UserNotFound();
    if(typeof body.isAdmin === 'boolean') user.isAdmin = body.isAdmin;
    await user.save();
    res.json(user);
  },
  async delete(req, res) {
    if(!res.locals.user.isAdmin) throw new app.errors.NoPerm();
    const user = req.params.userId ? await User.findById(req.params.userId).whereValid() : null;
    if(!user) throw new app.errors.UserNotFound();
    await user.safeRemove();
    res.json(user);
  },
};
