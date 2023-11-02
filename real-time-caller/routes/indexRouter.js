const express = require("express");
const router = express.Router();
const accountRouter = require('./AccountRouter')
const fileManagerRouter = require('./FileManagerRouter')



router.use('', accountRouter)
router.use('', fileManagerRouter)

module.exports = router;
