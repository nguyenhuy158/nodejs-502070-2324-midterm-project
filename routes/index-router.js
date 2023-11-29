const express = require("express");
const router = express.Router();

const apiRouter = require('./api-router');
const accountRouter = require('./account-router');
const errorRouter = require('./error-router.js');

const { isLoggedIn } = require('../controllers/index-controller');
const { checkResetLogin } = require('../controllers/index-controller');
const { getHomePage } = require('../controllers/index-controller');
const { getRoomPage } = require('../controllers/index-controller');

// account router
router.use(accountRouter);

router.use(checkResetLogin);
router.use(isLoggedIn);

// api router
router.get("/", getHomePage);
router.get('/room/:roomName', getRoomPage);
router.use(/^\/(api|rest)/, apiRouter);

// error router
router.use(errorRouter);

module.exports = router;
