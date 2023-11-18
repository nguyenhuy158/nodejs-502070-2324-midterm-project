
const express = require('express');
const router = express.Router();

router.get('/current-user', (req, res) => {
    try {
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

router.get('/users', (req, res) => {
    res.send('List of users');
});

router.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`User with ID ${userId}`);
});

module.exports = router;
