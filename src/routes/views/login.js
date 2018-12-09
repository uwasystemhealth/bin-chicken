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

    const { user } = await request(options);

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
    if(req.session.loggedIn) return res.redirect('/');
    if(req.method === 'GET') return res.render('login', {layout: 'main'});
    let username = req.body.login_username;
    let password = req.body.login_password;
    try {
        const user = await loginRequest(username, password);
        req.session.username = user.username;
        req.session.loggedIn = true;
        res.redirect(req.session.preLoginPath || '/');
    } catch(err){
        console.error(err);
        res.render('login', {errorMsg: (err.error && err.error.message) || err.message, username})
    }
};