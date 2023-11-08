const express = require("express");
const router = express.Router();
const accountRouter = require('./AccountRouter');
const fileManagerRouter = require('./FileManagerRouter');
const AccountController = require('../controllers/accountController');
const indexController = require('../controllers/indexController');


router.use('', accountRouter);
router.use('', fileManagerRouter);

router.get("/", indexController.home);

router.get("/logout", AccountController.getLogout);


module.exports = router;
