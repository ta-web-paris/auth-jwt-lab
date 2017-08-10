const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/signup', (req, res, next) => {
  // extract the info we need from the body
  // of the request
  const {
    username,
    name,
    password
  } = req.body;

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

module.exports = router;
