const app = require('../../app');

// eslint-disable-next-line
const mongoose = app.mongoose = require('mongoose');
const user = require('./models/user.js');
const log = require('./models/log.js');
const config = require('./models/config.js');

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bin-chicken', { useNewUrlParser: true });

app.models = {
  user,
  log,
  config,
};
