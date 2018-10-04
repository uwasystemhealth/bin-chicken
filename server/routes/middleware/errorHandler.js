const app = require('../../app');

module.exports = (err, req, res, next) => {
    try{
        if(res.locals.log) res.locals.log.logError(err);
    } catch(err) {console.error(err.stack)}
    if(err.name === 'ValidatorError'){
        return res.status(400).json({success: false, message: err.message, error: err.name, errors: err.errors});
    } else if(!app.errors[err.name]){
        console.error(err.stack);
        err = new app.errors.Internal();
    }
    return res.status(err.status).json({success: false, message: err.message, error: err.name});
};