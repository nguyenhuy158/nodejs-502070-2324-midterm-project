const express = require("express");
const router = express.Router();

const apiRouter = require('./api-router');
const accountRouter = require('./account-router');
const errorRouter = require('./error-router');

const { isLoggedIn } = require('../controllers/index-controller');
const { checkResetLogin } = require('../controllers/index-controller');
const { getHomePage } = require('../controllers/index-controller');
const { getRoomPage } = require('../controllers/index-controller');

router.use(accountRouter);
router.use(checkResetLogin);
router.use(isLoggedIn);
router.get("/", getHomePage);
router.get('/room/:roomName', getRoomPage);
router.use(/^\/(api|rest)/, apiRouter);

// error router
router.use(errorRouter);

module.exports = router;
