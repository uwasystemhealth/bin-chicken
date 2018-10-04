const routes = require('express').Router();
const ratelimit = require('../middleware/ratelimit');
const checkToken = require('../middleware/checkToken');
const wrapAsync = require('../../lib/wrapAsync');

routes.use('/', ratelimit.prevent);

routes.use('/user/', checkToken('userToken'), require('./user/'));
routes.post('/login', checkToken('api'), wrapAsync(require('./login')));
routes.post('/card', checkToken('api'), wrapAsync(require('./card')));
routes.post('/ping', checkToken('api'), wrapAsync(require('./ping')));

routes.use('/', require('../middleware/errorHandler'));

module.exports = routes;