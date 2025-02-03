const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { connectDB, _ } = require('./db/connect');
const populateDatabase = require('./db/populate');

require('dotenv').config();

const app = express();

const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const eventsRouter = require('./routes/events');

const start = async () => {
  try {
    await connectDB(process.env.DB_URL);
  } catch (error) {
    console.log(error);
  }
};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', usersRouter);
app.use('/admin', adminRouter);
app.use('/eventos', eventsRouter);

start().then(populateDatabase());

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
