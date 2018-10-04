const mongoose = require('mongoose');
const {Schema} = mongoose;
const app = require('../app');

const LogSchema = new Schema({
    token: {
        type: Schema.Types.ObjectId,
        ref: 'Token'
    },
    username: {
        type: String,
        maxLength: 1024,
    },
    success: Boolean,
    ips: [String],
    path: String,
    hostname: String,
    message: String,
    error: String,
    data: Schema.Types.Mixed,
}, {timestamps: true});

LogSchema.methods.logError = function(err){
    this.error = err.name;
    this.message = err.message;
    this.success = false;
    return this.save();
};

LogSchema.methods.logSuccess = function(data={}){
    for(let i in data) this[i] = data[i];
    this.success = true;
    return this.save();
};

module.exports = mongoose.model('Log', LogSchema);