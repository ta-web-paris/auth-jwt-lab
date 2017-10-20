require('dotenv').config();
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const passport = require('passport');
const User = require('./models/user');
const config = require('./config');
const { Strategy, ExtractJwt } = require('passport-jwt');
const FacebookStrategy = require('passport-facebook');

mongoose.connect('mongodb://localhost/blog-lab', { useMongoClient: true });

const app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
// Create the strategy for JWT
const strategy = new Strategy(
  {
    // this is a config we pass to the strategy
    // it needs to secret to decrypt the payload of the
    // token.
    secretOrKey: config.jwtSecret,
    // This options tells the strategy to extract the token
    // from the header of the request
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  (payload, done) => {
    // payload is the object we encrypted at the route /api/token
    // We get the user id, make sure the user exist by looking it up
    console.log('Finding', payload);
    User.findById(payload.id).then(user => {
      if (user) {
        // make the user accessible in req.user
        done(null, user);
      } else {
        done(new Error('User not found'));
      }
    });
  }
);
// tell pasport to use it
passport.use(strategy);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FB_CLIENT_ID,
      clientSecret: process.env.FB_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/api/auth/facebook/callback',
      // all fields: https://developers.facebook.com/docs/graph-api/reference/v2.10/user
      profileFields: ['id', 'displayName', 'email'],
    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOne({
        facebookId: profile.id,
      })
        .then(user => {
          if (user) {
            return user;
          } else {
            const user = new User({
              // we need a username
              username: profile.email,
              name: profile.displayName,
              facebookId: profile.id,
            });
            return user.save();
          }
        })
        .then(user => {
          cb(null, user);
        })
        .catch(err => cb(err));
    }
  )
);

const index = require('./routes/index');
const authRoutes = require('./routes/auth');

app.use('/', index);
app.use('/api', authRoutes);

// This is an example of protected route
app.get(
  '/api/secret',
  // this is protecting the route and giving us access to
  // req.user
  passport.authenticate('jwt', config.jwtSession),
  (req, res) => {
    // send the user his own information
    res.json(req.user);
  }
);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err);
  // return the error message only in development mode
  res.json({
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

module.exports = app;
