const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');

const passport = require('passport');
const User = require('./models/user');
const config = require('./config');
const {Strategy, ExtractJwt} = require('passport-jwt');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/jwt-test', {useMongoClient: true});

const app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

passport.initialize();
const strategy = new Strategy(
  { 
    secretOrKey: config.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  },
  (payload, done) => {
    User.findById(payload.id).then(user => {
      if (user) {
        done(null, user);
      } else {
        done(new Error("User not found"));
      }
    });
  }
);
passport.use(strategy);

const index = require('./routes/index');
const authRoutes = require('./routes/auth');

app.use('/', index);
app.use('/api', authRoutes);

app.get('/api/secret', passport.authenticate('jwt', config.jwtSession),(req, res) => {
    res.json(req.user);
  }
);

// to add the authentication to all pages, take the passport.authenticate('jwt', config.jwtSession) and either create a middleware on this page, so that all pages need this, or put it as middleware in each route, e.g. router.get('/homepage', passport.authenticate('jwt', config.jwtSession), (req, res) => etc etc)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  // return the error message only in development mode
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err.message : {}
  });
});

module.exports = app;

