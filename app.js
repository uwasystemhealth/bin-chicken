// initiate packages
/*eslint-env node */
require('dotenv').config();

const app = module.exports = {};

app.errors = require('./server/errors/');

require('./server/database/');
require('./server');