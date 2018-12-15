const request = require('request-promise-native');
const app = require('../../../app');

const loginRequest = async (username, pass, tok) => {
  const token = tok || process.env.PHEME_API_TOKEN;

  const options = {
    method: 'POST',
    uri: 'https://auth.uwamakers.com/api/login',
    body: {
      user: username,
      pass,
      token,
    },
    json: true,
  };
  let user = null;

  try {
    user = (await request(options)).user; // eslint-disable-line prefer-destructuring
  } catch(err) {
    // console.error(err);
    throw new app.errors.InvalidLogin((err.error && err.error.message) || err.message);
  }

  const userModel = await app.models.user.findOne({ username: user.username, enabled: true });
  if(!userModel) throw new app.errors.UserDisabled();
  userModel.fullname = user.fullname;
  userModel.firstname = user.firstname;
  userModel.lastname = user.lastname;
  userModel.email = user.email;
  await userModel.save();

  return userModel;
};

module.exports = async (req, res) => {
  if (req.session.loggedIn) {
    return res.json(await app.models.user.findOne({
      username: req.session.username,
      enabled: true,
    }));
  }
  const { username, password } = req.body;
  if (!username || !password) throw new app.errors.InvalidLogin();
  const user = await loginRequest(username, password);
  req.session.username = user.username;
  req.session.loggedIn = true;
  return req.session.save((err) => {
    if (err) {
      console.error(err); // eslint-disable-line no-console
      throw new app.errors.Internal();
    }
    return res.json(user);
  });
};
