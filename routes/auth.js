const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jwt-simple');
const passport = require('passport');
const config = require('../config');

// SIGNUP ROUTE
router.post('/signup',(req, res, next) => {
    const {username, name, password} = req.body;

    const user = new User(
        {username, name}
    );

    User.register(user, password, (err) => {
        if(err) {
            return next(err);
        }
        res.json({success: true});
    });
});

// LOGIN ROUTE
const authenticate = User.authenticate(); // comes from passport module
router.post('/login', (req, res, next) => {
    const {username, password} = req.body;

    if(username && password){
        authenticate(username, password, (err, user, failed) => {
            if(err){
                return next(err);
            }
            if(failed) {
                return res.status(401).json(
                    {error: failed.message}
                );
            }
            if(user){
                const payload = {id: user.id};
                const token = jwt.encode(payload, config.jwtSecret);
                res.json({token});
            }
        });
    } else {
        res.sendStatus(401);
    }
});


module.exports = router;