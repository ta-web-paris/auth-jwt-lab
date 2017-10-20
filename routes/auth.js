const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require("jwt-simple");
const passport = require("passport");
const config = require("../config");

router.post('/signup', (req, res, next) => {
  // extract the info we need from the body
  // of the request
  const { username, name, password } = req.body;

  // create the new user
  // notice how we don't pass the password because
  // we're letting User.register add the hashed version
  // for us

  const user = new User({
    username,
    name
  });

  User.register(user, password, (err) => {
    if (err) {
      return next(err)
    }
    res.json({ success: true })
  })
});


const authenticate = User.authenticate()
router.post('/login', (req, res, next) => {
  const { username, password } = req.body
  console.log(req.body)
  if (username && password) {
    authenticate(username, password, (err, user, failed) => {
      if (err) return next(err)
      if (failed) return res.status(401).json({ error: 'Authentication failed' })
      if (user) {
        const payload = {
          id: user.id,
          // name: user.name,
        }
        const token = jwt.encode(payload, config.jwtSecret);
        res.json({ token })
      }
    })
  } else {
    res.sendStatus(401)
  }
})

router.get('/secret',
  passport.authenticate("jwt", config.jwtSession),
  (req, res) => {
    res.json(req.user);
  }
);


module.exports = router;