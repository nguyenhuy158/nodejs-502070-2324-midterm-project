const express = require("express");
const router = express.Router();
const accountRouter = require('./accountRouter');
const apiRouter = require('./apiRouter');
const indexController = require('../controllers/indexController');


router.use('', accountRouter);
router.get("/", indexController.isLoggedIn, indexController.home);
router.get('/room/:roomName', indexController.isLoggedIn, indexController.room);
router.use(/^\/(api|rest)/, indexController.isLoggedIn, apiRouter);

// error handlers middleware
router.use(function (req, res) {
    res.status(404);
    res.render('404', {});
});
router.use(function (error, req, res) {
    console.log(`🚀 🚀 file: indexRouter.js:19 🚀 error`, error);
    res.status(500);
    res.render('500', { error: error });
});

module.exports = router;
