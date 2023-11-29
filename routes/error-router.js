const express = require("express");
const router = express.Router();

const errorController = require('../controllers/error-controller');

router.use(errorController.error404);
router.use(errorController.error500);

module.exports = router;
