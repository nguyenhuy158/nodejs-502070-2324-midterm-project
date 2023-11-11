
const express = require('express');
const router = express.Router();

const apiAccountRouter = require('./apiAccountRouter');

router.get('/current-user', (req, res) => {
    try {
        // console.log(`🚀 🚀 file: apiRouter:6 🚀 router.get 🚀 req.session.user`, req.session.user);
        // console.log(`🚀 🚀 file: apiRouter:14 🚀 router.get 🚀 {}`, {
        //     id: req.session.user.id,
        //     fullName: req.session.user.fullName,
        //     username: req.session.user.username,
        //     email: req.session.user.email,
        // });
        res.json({
            id: req.session.user.id,
            fullName: req.session.user.fullName,
            username: req.session.user.username,
            email: req.session.user.email,
        });
    } catch (error) {
        console.log(`🚀 🚀 file: apiRouter:15 🚀 router.get 🚀 error`, error);
        res.status(500).json({ error: 'Internal server error' + error });
    }
});

// router.user('/account', apiAccountRouter);

router.get('/users', (req, res) => {
    res.send('List of users');
});

router.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`User with ID ${userId}`);
});

module.exports = router;
