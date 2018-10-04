
const app = require('../../app');

module.exports = async (req, res) => {
    const card = await app.models.Token.findOne({token: req.body.key, type: 'card'}).whereValid();
    if(!card) throw new app.errors.InvalidCard();
    const user = await app.models.User.findById(card.owner);
    let userToken = undefined;
    
    if(typeof req.body.userToken === 'number' || req.body.userToken){
        let expires = 24*60*60*1000;
        if(typeof req.body.userToken === 'number' && req.body.userToken > 0 && req.body.userToken <= expires){
            expires = req.body.userToken;
        }
        expires += Date.now();
        userToken = (await app.models.Token.createToken(user._id, user.username, 64, {expires, type: 'userToken'})).token;
    }

    res.json({success: true, user: user.toData(), userToken});
    res.locals.log.logSuccess({username: user.username});
    req.brute.reset();
};