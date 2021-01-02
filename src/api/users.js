// Imports for external dependencies
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Imports for internal dependencies
const User = require('../models/User');

router.post('/register', async (req, res) => {
    const today = new Date();
    const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        created: today
    };
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                userData.password = hash;
                User.create(userData).then((createdUser) => {
                    res.json({
                        message: `User ${createdUser.firstName} ${createdUser.lastName} has successfully registered!`,
                        registered: true
                    });
                });
            });
        } else {
            res.json({ error: 'User already exists!' });
        }
    } catch (err) {
        res.send({ error: err });
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                const payload = {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                };
                const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: 1440 });
                res.send({ user: payload, token });
            } else {
                // Use next middleware here
                res.json({ error: 'Incorrect password' });
            }
        } else {
            res.json({ error: 'User does not exist' });
        }
    } catch (err) {
        res.send({ error: err });
    }
});

// Not in use
router.get('/loggedIn', async (req, res) => {
    const decoded = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);
    const user = await User.findOne({ _id: decoded._id });
    res.send({ user });
});

// Not in use
router.get('/profile', async (req, res) => {
    try {
        const decoded = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);
        const user = await User.findOne({ _id: decoded._id });
        if (user) {
            res.json(user);
        } else {
            res.send({ error: 'User does not exist' });
        }
    } catch (err) {
        res.send({ error: err });
    }
});

module.exports = router;