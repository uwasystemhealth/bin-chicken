// initiate packages
/*eslint-env node */
require('dotenv').config();

const app = module.exports = {};

app.errors = require('./lib/errors');

require('./database/');
require('./lib/getInstanceConfig');

if(app.config.server.enabled) require('./server');
if(app.config.proxy.enabled) require('./proxy');
if(app.config.docker.enabled) require('./docker');