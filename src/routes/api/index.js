const routes = require('express').Router();
const ratelimit = require('../middleware/ratelimit');
const checkLogin = require('../middleware/logincheck');
const wrapAsync = require('../../lib/wrapAsync');
const configs = require('./configs');
const users = require('./users');

routes.use('/', ratelimit.prevent);

routes.get('/config/', checkLogin, wrapAsync(configs.find));
routes.get('/config/:confId', checkLogin, wrapAsync(configs.get));
routes.post('/config/', checkLogin, wrapAsync(configs.create));
routes.post('/config/:confId', checkLogin, wrapAsync(configs.patch));
routes.post('/config/render/', checkLogin, wrapAsync(configs.render));
routes.get('/config/render/:confId', checkLogin, wrapAsync(configs.render));


routes.get('/user/', checkLogin, wrapAsync(users.find));
routes.get('/user/:confId', checkLogin, wrapAsync(users.get));
routes.post('/user/', checkLogin, wrapAsync(users.create));
routes.post('/user/:confId', checkLogin, wrapAsync(users.patch));

routes.get('/lecerts', checkLogin, wrapAsync(require('./lecerts')));
routes.post('/ping', checkLogin, wrapAsync(require('./ping')));

routes.use('/', require('../middleware/errorHandler'));

module.exports = routes;