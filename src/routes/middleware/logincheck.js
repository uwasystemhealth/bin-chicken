
const app = require('../../../app');

module.exports = async (req, res, next) => {
  if(req.session.loggedIn) {
    return app.models.user.findOne({ username: req.session.username }).then((user) => {
      res.locals.user = user;
      next();
    }).catch(console.error); // eslint-disable-line no-console
  }
  if(
    req.hostname === 'localhost'
        && req.method === 'GET'
        && (req.path === '/api/config/' || req.path.indexOf('/api/config/render') === 0)
  ) return next();
  if(req.path.indexOf('login') === -1) {
    // save the path that the user was trying to access for after login
    if(req.path !== '/') req.session.preLoginPath = req.path;
    res.redirect('/login');
  } else {
    next();
  }
  return null;
};
