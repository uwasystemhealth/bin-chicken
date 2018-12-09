const app = require('../../../app');

module.exports = async (req, res) => {
    if(!req.session.loggedIn) return res.redirect('/');
    res.render('users');
};