// initiate packages
/*eslint-env node */
require('dotenv').config();

const app = module.exports = {};

app.errors = require('./src/errors/');

require('./src/database/');
require('./src');