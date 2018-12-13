const request = require('request-promise-native');
const app = require('../../../app');

const loginRequest = async (username, pass, token) => {
    if(!token) token = process.env.PHEME_API_TOKEN;
    
    const options = {
        method: 'POST',
        uri: 'https://auth.uwamakers.com/api/login',
        body: {
            user: username,
            pass: pass,
            token: token
        },
        json: true,
    };
    let user = null;

    try {
      user = (await request(options)).user;
    } catch(err){
      //console.error(err);
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

// logout, pretty basic, delete the user's session
// post for ajax calls to logout, returns json with an error if there is one
module.exports = async (req, res) => {
    if(req.session.loggedIn) return res.json(await app.models.user.findOne({ username: req.session.username, enabled: true }));
    let username = req.body.username;
    let password = req.body.password;
    const user = await loginRequest(username, password);
    req.session.username = user.username;
    req.session.loggedIn = true;
    res.json(user);
};