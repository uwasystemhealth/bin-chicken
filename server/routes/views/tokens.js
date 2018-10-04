const app = require('../../app');

module.exports = async (req, res) => {
    if(!req.session.loggedIn) return res.redirect('/');
    if(req.method === 'POST'){
        if(req.body.action === 'delete'){
            try {
                if(!req.body.token) throw new app.errors.TokenRequired();
                const token = await app.models.Token.findOne({token: req.body.token, owner: res.locals.user._id}).whereValid();
                if(!token) throw new app.errors.InvalidToken();
                await token.safeRemove();
                res.locals.successMessage = `Successfully removed the token for ${token.name}.`;
            } catch(err){
                res.locals.errorMessage = err.message;
            }
        } else {
            try {
                if(!req.body.name) throw new app.errors.AppNameRequired();
                if((await app.models.Token.count({name: req.body.name, owner: res.locals.user._id}).whereValid()) > 0){
                    throw new app.errors.AppNameExists();
                }
                if((await app.models.Token.count({owner: res.locals.user._id})) > 100){
                    throw new app.errors.TokenLimit();
                }
                const token = await app.models.Token.createToken(res.locals.user._id, req.body.name, 32);
                res.locals.successMessage = 'Successfully created the new token.';
            } catch(err){
                res.locals.errorMessage = err.message;
            }
        }
    }
    res.locals.tokens = await app.models.Token.find({owner: res.locals.user._id}).whereValid();
    res.render('tokens');
};