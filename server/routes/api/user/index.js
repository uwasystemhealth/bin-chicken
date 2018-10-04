const routes = require('express').Router();
const cards = require('./cards');
const wrapAsync = require('../../../lib/wrapAsync');

routes.use('/', (req, res, next)=>{req.brute.reset();next();})

routes.get('/cards/:cardId', wrapAsync(cards.get));
routes.post('/cards/:cardId', wrapAsync(cards.patch));
routes.delete('/cards/:cardId', wrapAsync(cards.delete));
routes.get('/cards', wrapAsync(cards.find));
routes.post('/cards', wrapAsync(cards.create));

routes.post('/ping', wrapAsync(require('./ping')));
routes.use('/', wrapAsync(require('./get')));

module.exports = routes;