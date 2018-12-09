const mongoose = require('mongoose');
const {Schema} = mongoose;
const app = require('../../../app');
const getCerts = require('../../lib/getCurrentLE');
const enabledType = require('../types/enabled.type');
const domainType = require('../types/domain.type');

const ConfigSchema = new Schema({
    type: {
        type: String,
        default: 'proxy',
        enum: ['proxy', 'redirect'],
    },
    domain: { ...domainType, required: true },
    idiotProof: {
        type: Boolean,
        required: true,
        default: true,
    },
    aliases: [domainType],
    leDomain: {
        ...domainType,
        validate: async (v) => {
            const certs = await getCerts();
            return certs[v] && !!certs[v].domains.find( (domain) => {
                RegExp(`$${domain.replace('*', '[\w.-]+')}^`, 'i').test(v);
            });;
        },
        toLower: true,
    },
    leUpgrade: {
        type: Boolean,
        default: true,
    },
    host: { ...domainType, default: 'localhost' },
    port: {
        type: Number,
        min: 0,
        max: 65535,
    },
    redirect: String,
    permanent: {
        type: Boolean,
        default: false,
    },
    preserve: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    collabs: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    enabled: enabledType,
}, {timestamps: true});

ConfigSchema.methods.safeRemove = function(){this.enabled = false; return this.save()};

ConfigSchema.methods.getPerm = function(user){
    if(user.isAdmin) return 'admin';
    if(this.owner+'' === user._id+'') return 'admin';
    if(this.collabs && this.collabs.find(v=>v+'' === user._id+'')) return 'collab';
    return 'none';
};

ConfigSchema.query.whereValid = function(){
    return this.where({enabled: true, $or: [{expires: {$exists: false}}, {expires: {$gte: ISODate()}}]});
};

module.exports = mongoose.model('Config', ConfigSchema);