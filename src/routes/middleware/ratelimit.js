const ExpressBrute = require('express-brute');
const MongooseStore = require('express-brute-mongoose');
const mongoose = require('mongoose');
const app = require('../../app');

const BruteForceSchema = new mongoose.Schema({
    _id: { type: String },
    data: {
      count: Number,
      lastRequest: Date,
      firstRequest: Date
    },
    expires: { type: Date, index: { expires: '1d' } }
  }, { collection: 'bruteforce' });

const model = mongoose.model('bruteforce', BruteForceSchema);
const store = new MongooseStore(model);

module.exports = new ExpressBrute(store, app.config.ratelimit);