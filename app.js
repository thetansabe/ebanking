var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const db = require('./config/db/index')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const walletRouter = require('./routes/wallet');
const adminRouter = require('./routes/admin');

var app = express();
db.connect()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('mysecretcookie'));
app.use(require('express-session')())

app.use((req, res, next) => {
  res.locals.flash = req.session.flash
  delete req.session.flash
  next()
})

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', cors(), usersRouter);
app.use('/wallet', cors(), walletRouter);
app.use('/admin', cors(), adminRouter);

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

  //re direct trang dang nhap
  res.render('error');
});

module.exports = app;
