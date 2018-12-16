/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const mongoose = require('mongoose');
const namor = require('namor');

const { Schema } = mongoose;
// const app = require('../../../app');
const getCerts = require('../../lib/getCurrentLE');
const testConfig = require('../../lib/testConfig');
const createConfig = require('../../lib/createConfig');
const deleteConfig = require('../../lib/deleteConfig');
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
      return !!certs[v];
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
  key: String,
  enabled: enabledType,
}, { timestamps: true });

ConfigSchema.pre('save', async function () {
  const output = await testConfig(this);
  if(output.indexOf('test is successful') === -1) throw new Error('Invalid configuration');
});

ConfigSchema.post('save', async function () {
  if(this.enabled) await createConfig(this);
  else await deleteConfig(this);
});

ConfigSchema.methods.safeRemove = function () { this.enabled = false; return this.save(); };

ConfigSchema.methods.getPerm = function (user) {
  if(user.isAdmin) return 'admin';
  if(`${this.owner}` === `${user._id}`) return 'admin';
  if(this.collabs && this.collabs.find(v => `${v}` === `${user._id}`)) return 'collab';
  return 'none';
};

ConfigSchema.statics.genKey = async function () {
  let key = '';
  const genKey = async () => {
    key = namor.generate({ words: 2, numbers: 0 });
    if(await this.countDocuments({ key })) await genKey();
  };
  await genKey();
  return key;
};

ConfigSchema.query.whereValid = function () {
  return this.where({ enabled: true });
};

module.exports = mongoose.model('Config', ConfigSchema);
