
const app = require('../../app');
const loginUser = require('../../lib/loginUser');

// logout, pretty basic, delete the user's session
// post for ajax calls to logout, returns json with an error if there is one
module.exports = async (req, res) => {
    if(req.session.loggedIn) return res.redirect('/');
    if(req.method === 'GET') return res.render('login', {layout: 'main'});
    let username = req.body.login_username;
    let password = req.body.login_password;
    try {
        const user = await loginUser(username, password);
        if(!user.enabled) throw new app.errors.UserDisabled();
        req.session.username = user.username;
        req.session.loggedIn = true;
        res.redirect(req.session.preLoginPath || '/');
    } catch(err){
        console.error(err);
        res.render('login', {errorMsg: err.message, username})
    }
};