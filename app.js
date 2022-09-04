const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const chalk = require('chalk')
const indexRouter = require('./routes/index');
const config = require('./app.config');
const { timeStamp } = require('./utils/utilities');

console.info(timeStamp(), chalk.magentaBright("Starting up server..."))

const connect = mongoose.connect(config.mongoUrl, {
  user: config.mongoUser,
  pass: String(config.mongoPass),
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connect.then((db) => {
  console.info(timeStamp(), chalk.yellowBright("Established connection with the database!"));
}, (err) => {console.log(err)});


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.set('trust proxy', true);
console.info(timeStamp(), chalk.yellowBright("Trust-proxy enabled"))
app.use((req, res, next) => {
  // Set custom X-Powered-By header
  res.setHeader('X-Powered-By', 'SecureComm');
});

// Making a custom logging pattern
logger.token("custom", `:timestamp ${chalk.magentaBright(":remote-addr")} - ${chalk.greenBright.bold(":method")} :url ${chalk.yellowBright("HTTP/:http-version")} (:status)`);
logger.token('remote-addr', (req, res) => {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
})
logger.token('status', (req, res) => {
  if (res.statusCode > 400) return chalk.redBright.bold(res.statusCode)
  else return chalk.greenBright.bold(res.statusCode)
})
logger.token('timestamp', () => {
  return timeStamp()
})
app.use(logger('custom'));
console.info(timeStamp(), chalk.yellowBright("Logger enabled"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// initialize passport middleware for the app
app.use(passport.initialize());

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
