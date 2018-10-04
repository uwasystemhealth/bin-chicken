const mongoose = require('mongoose');
const {Schema} = mongoose;
const app = require('../app');
const nameType = require('./types/name.type');
const enabledType = require('./types/enabled.type');
const genToken = require('../lib/token');

const TokenSchema = new Schema({
    type: {
        type: String,
        default: 'api',
        enum: ['api', 'userToken', 'card']
    },
    token: {
        type: String,
        default: genToken,
        required: true,
    }, 
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: nameType,
    enabled: enabledType,
    expires: {
        type: Date,
    }
}, {timestamps: true});

TokenSchema.methods.safeRemove = function(){this.enabled = false; return this.save()};

TokenSchema.query.whereValid = function(){
    return this.where({enabled: true, $or: [{expires: {$exists: false}}, {expires: {$gte: ISODate()}}]});
};

TokenSchema.statics.createToken = async function(owner, name, tokenLength, data){
    const entry = new this({owner, name, token: genToken(tokenLength), ...data});
    await entry.save();
    return entry;
};

TokenSchema.statics.hasToken = async function(token){
    return (await this.count().where({token}).whereValid()) > 0;
};

module.exports = mongoose.model('Token', TokenSchema);