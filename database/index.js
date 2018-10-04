const app = require('../app');
const mongoose = app.mongoose = require('mongoose');

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bin-chicken', {useNewUrlParser: true});

