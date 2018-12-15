/* eslint-disable func-names */
const mongoose = require('mongoose');
const { Schema } = mongoose;
// const app = require('../../../app');
const usernameType = require('../types/username.type');
const emailType = require('../types/email.type');
const nameType = require('../types/name.type');
const enabledType = require('../types/enabled.type');

const UserSchema = new Schema({
  username: Object.assign({ index: true, unique: true }, usernameType),
  email: { ...emailType, required: false },
  fullname: { ...nameType, required: false },
  lastname: { ...nameType, required: false },
  firstname: { ...nameType, required: false },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  canCreate: {
    type: Boolean,
    required: true,
    default: false,
  },
  enabled: enabledType,
}, { timestamps: true });

UserSchema.methods.safeRemove = function () { this.enabled = false; return this.save(); };

UserSchema.methods.toData = function () {
  return {
    username: this.username,
    email: this.email,
    fullname: this.fullname,
    lastname: this.lastname,
    firstname: this.firstname,
  };
};

UserSchema.query.whereValid = function () { return this.where({ enabled: true }); };

const User = mongoose.model('User', UserSchema);
module.exports = User;

(async () => {
  if (!(await User.countDocuments())) await (new User({ username: '21299527', isAdmin: true })).save();
})();
