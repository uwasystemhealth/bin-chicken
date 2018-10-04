
const app = require('../../app');
const loginUser = require('../../lib/loginUser');

/**
 * @api {post} /api/login Login a user
 * @apiName Login User
 * @apiGroup Login
 *
 * @apiParam {String} user User's Pheme number, should pass /^\d{8}$/.
 * @apiParam {String} pass User's Pheme password.
 * @apiParam {Number{1-86400000}} [userToken]=false whether to return a userToken for revalidation, can be a Boolean true/false, or the expirey time in ms.
 *
 * @apiSuccess {String} user.username Pheme number of the User.
 * @apiSuccess {String} user.email  Email of the User.
 * @apiSuccess {String} user.fullname Fullname of the User.
 * @apiSuccess {String} user.firstname Firstname of the User.
 * @apiSuccess {String} user.lastname  Lastname of the User.
 * @apiSuccess {String} userToken If requested, the userToken for revalidating. Should be stored in either the client session, or passed to the client for frontend use.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "success": true,
 *          "user": {
 *              "username": "12345678",
 *              "email": "12345678@student.uwa.edu.au",
 *              "fullname": "Jo Smith",
 *              "firstname": "Jo",
 *              "lastname": "Smith"
 *          }
 *      }
 *
 * @apiError InvalidLogin The user + pass were invalid, either in a bad format or incorrect.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "success": false,
 *         "error": "InvalidLogin",
 *         "message": "Invalid login details provided."
 *     }
 */
module.exports = async (req, res) => {
    if(typeof req.body.user !== 'string' || !(/^\d{8}$/.test(req.body.user)) ) throw new app.errors.InvalidLogin();
    res.locals.log.username = req.body.user;
    const user = await loginUser(req.body.user, req.body.pass);
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
    res.locals.log.logSuccess();
    req.brute.reset();
};