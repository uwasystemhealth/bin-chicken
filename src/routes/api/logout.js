const app = require('../../../app');

// logout, pretty basic, delete the user's session
// post for ajax calls to logout, returns json with an error if there is one
module.exports = (req, res) => new Promise((resolve) => {
  req.session.destroy((err) => {
    if(err) {
      console.error(err); // eslint-disable-line no-console
      const error = new app.errors.Internal();
      return resolve(res.json({ success: false, message: error.message }));
    }
    return resolve(res.json({ success: true }));
  });
});
