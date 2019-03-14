// initiate packages
/* eslint-env node */
require('dotenv').config();

const app = module.exports = {}; // eslint-disable-line no-multi-assign

app.errors = require('./src/errors/');

require('./src/database/');
require('./src');


// eslint-disable-next-line global-require
if (process.env.NODE_ENV === 'production') require('./src/lib/initConfigFiles')();
