const express = require("express");
const router = express.Router();
const accountRouter = require('./account-router');
const apiRouter = require('./api-router');
const indexController = require('../controllers/index-controller');


router.use('', accountRouter);
router.use(indexController.checkResetLogin);
router.use(indexController.isLoggedIn);
router.get("/", indexController.home);
router.get('/room/:roomName', indexController.room);
router.use(/^\/(api|rest)/, apiRouter);

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
