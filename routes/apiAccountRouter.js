
const express = require('express');
const router = express.Router();

const apiAccountController = require('../controllers/apiAccountController');

router.get('/login', apiAccountController.getLogin);
router.post('/login', apiAccountController.postLogin);
router.get('/register', apiAccountController.getRegister);
router.post('/register', apiAccountController.postRegister);

module.exports = router;
