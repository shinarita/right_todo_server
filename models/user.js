const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10

const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');

const UserSchema = new Schema({
  name: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: false }
})

UserSchema.pre('save', function (next) {
  const user = this
  if (!user.isModified('password')) {
    return next()
  }
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) {
        return next(err)
      }
      user.password = hash
      next()
    })
  })
})

UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    console.log(candidatePassword, this.password, isMatch)
    return isMatch
  } catch (err) {
    return false
  }
}

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({
    _id: this._id,
    isAdmin: this.isAdmin
  }, config.get('privateKey'), {
    expiresIn: '7d'
  })
  return token
}

function validateUser(user) {
  const schema = {
    name: Joi.string().required(),
    password: Joi.string().required(),
  }
  return Joi.validate(user, schema)
}

module.exports = {
  User: mongoose.model('User', UserSchema),
  validate: validateUser
}