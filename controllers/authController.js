const { User, validate } = require('../models/user')
exports.auth_signup = async (req, res, next) => {
  const { error } = validate(req.body)
  if (error) {
    return res.status(400).send(error.details[0].message)
  }
  const user = await User.findOne({ name: req.body.name })
  if (user) {
    return res.status(400).send('User already registered.')
  }
}

exports.auth_login = async (req, res, next) => {
  const { username, password: reqPassword } = req.body
  try {
    const user = await User.findOne({ name: username })
    if (!user) {
      return res.status(401).send('请输入正确的用户名和密码。')
    }
    const isMatch = await user.comparePassword(reqPassword)
    if (!isMatch) {
      return res.status(401).send('Fail Authentication')
    }
    const token = user.generateAuthToken()
    res.header('x-auth-token', token).send({
      id: user._id,
      name: user.name
    })
  } catch (err) {
    return next(err)
  }
}