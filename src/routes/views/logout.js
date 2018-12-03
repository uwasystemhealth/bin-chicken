const app = require('../../app');

// logout, pretty basic, delete the user's session
// post for ajax calls to logout, returns json with an error if there is one
module.exports = (req, res) => {
	req.session.destroy(function(err){
        if(req.method === 'GET') res.redirect('/');
		else if(err){
			console.error(err);
			err = app.errors.Internal()
			res.json({success: false, message: err.message});
		} else {
			res.json({success: true});
		}
	});
};