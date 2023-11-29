const express = require("express");
const router = express.Router();

const accountController = require("../controllers/account-controller");
const customValidator = require("../middlewares/custom-validator");

const { doubleCsrf } = require("csrf-csrf");
const { sessionConfig } = require("../config/config");
const { isLoggedIn } = require('../controllers/index-controller');
const { doubleCsrfOptions } = require("../config/config");

const { invalidCsrfTokenError } = doubleCsrf(doubleCsrfOptions);
const { generateToken } = doubleCsrf(doubleCsrfOptions);
const { validateRequest } = doubleCsrf(doubleCsrfOptions);
const { doubleCsrfProtection } = doubleCsrf(doubleCsrfOptions);

// router.use(session(sessionConfig));

router.get("/login", accountController.isNotAuthenticated, doubleCsrfProtection, accountController.getLogin);

router.post("/login", customValidator.postLogin, doubleCsrfProtection, accountController.postLogin);

router.get("/register", accountController.isNotAuthenticated, accountController.getRegister);

router.post("/register", customValidator.postRegister, accountController.postRegister);

router.get("/forget-password", accountController.isNotAuthenticated, accountController.getForgetPassword);

router.post("/forget-password", customValidator.postForgetPassword, accountController.postForgetPassword);

router.get("/email-confirm", accountController.getEmailConfirm);

router.post("/email-confirm", accountController.emailConfirm);

router.get("/logout", accountController.getLogout);

router.get("/reset-password", isLoggedIn, accountController.getChangePassword);

router.post("/reset-password", isLoggedIn, customValidator.postChangePassword, accountController.postChangepassword);

router.get("/logout-success", accountController.getLogoutSuccess);

module.exports = router;
