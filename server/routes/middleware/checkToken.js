
const app = require('../../app');
const wrapAsync = require('../../lib/wrapAsync');

module.exports = (tokenType='api') => wrapAsync(async (req, res, next) => {
    res.locals.log = new app.models.Log({ips: req.ips, hostname: req.hostname, path: req.originalUrl});
    let authToken = req.get('authorization');
    if(authToken){ 
        let [user, pass] = new Buffer(authToken.split(" ").pop(), "base64").toString("ascii").split(":");
        authToken = pass || user;
    } else if(req.body.token) authToken = req.body.token;
    else throw new app.errors.TokenRequired();

    let token = await app.models.Token.findOne({token: authToken, type: tokenType}).whereValid();
    if(!token) throw new app.errors.InvalidToken;
    res.locals.log.token = token._id;
    await res.locals.log.save();
    if(tokenType === 'userToken') res.locals.user = await app.models.User.findById(token.owner).whereValid();
    next();
});