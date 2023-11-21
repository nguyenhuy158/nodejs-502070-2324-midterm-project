/* eslint-disable no-undef */

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

router.post('/invite', (req, res) => {
    const { roomName, userInvited } = req.body;

    try {
        // check room is full 
        if (_rooms[roomName].members.length >= 2) {
            return res.json({
                error: true,
                message: `Room ${roomName} was full`
            });
        }
        // check user online
        if (!_users[userInvited]) {
            return res.json({
                error: true,
                message: `User ${userInvited} not online`
            });
        }
        // don't invite yourself
        if (userInvited === req.session.username) {
            return res.json({
                error: true,
                message: `Do not invite yourself`
            });
        }
        const inviteLink = `${req.protocol}://${req.get('host')}/room/${roomName}`;

        const targetSocketId = _users[userInvited];
        _io.to(targetSocketId).emit('invite', { roomName, userInvited, inviteLink });

        res.json({
            error: false,
            userInvited,
            inviteLink,
            message: 'Invite successfully',
        });
    } catch (error) {
        res.status(500).json({ error: false, message: 'Internal server error' + error });
    }
});

module.exports = router;
