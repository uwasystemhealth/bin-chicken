
const routes = require('express').Router();
const app = require('../../app');
const ratelimit = require('../middleware/ratelimit');
const requireDirectory = require('require-directory');

routes.use('/', 
    require('../middleware/logincheck')
);

const views = requireDirectory(module, {recurse: false})

for(let i in views){
    if(i === 'login' && process.env.NODE_ENV === 'production'){ 
        routes.use(`/${i}`, ratelimit.prevent, views[i]);
    } else routes.use(`/${i}`, views[i]);
}
routes.use('/', views.tokens);

module.exports = routes;