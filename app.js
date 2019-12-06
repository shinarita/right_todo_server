const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api')
const app = express()
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const { getMongoDbUrl, getAdministrator } = require('./utils')
const config = require("config");

if (!config.get('privateKey')) {
  console.error('FATAL ERROR: privateKey is no defined.')
  process.exit(1)
}

// mongodb
const mongoose = require('mongoose')
mongoose.connect(getMongoDbUrl(), {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})
mongoose.Promise = global.Promise
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB连接错误： '))

// 创建admin角色
const { User } = require('./models/user');
const { name, password } = getAdministrator();
(async function () {
  const admin = await User.findOne({ name: 'admin' })
  if (!admin) {
    var testUser = new User({
      name,
      password
    });
    testUser.save()
  }
})()

// setting
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter);
app.use('/api', apiRouter)

// app.use(session({
//   name: 'user_session',
//   secret: 'userssss',
//   resave: true,
//   saveUninitialized: false,
//   cookie: {
//     maxAge: 2592000000
//   },
//   store: new MongoStore({ mongooseConnection: db })
// }))

// 404
app.use((req, res, next) => {
  next(createError(404))
})

// error
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500)
  res.send('error')
})

module.exports = app