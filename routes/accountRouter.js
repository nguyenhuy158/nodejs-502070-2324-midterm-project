const express = require("express");
const router = express.Router();
const session = require("express-session");
const accountController = require("../controllers/accountController");
const customValidator = require("../middlewares/customValidator");
const { doubleCsrf } = require("csrf-csrf");

router.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: true,
    }),
);

const doubleCsrfOptions = {
    getSecret: () => "Secret",
    cookieName: "_crsf",
    getTokenFromRequest: (req) => req.body._csrf,
};
const { invalidCsrfTokenError, generateToken, validateRequest, doubleCsrfProtection } = doubleCsrf(doubleCsrfOptions);

router.get("/login", accountController.isNotAuthenticated, doubleCsrfProtection, accountController.getLogin);

router.post("/login", customValidator.postLogin, doubleCsrfProtection, accountController.postLogin);

router.get("/register", accountController.isNotAuthenticated, accountController.getRegister);

router.post("/register", customValidator.postRegister, accountController.postRegister);

router.get("/forget-password", accountController.isNotAuthenticated, accountController.getForgetPassword);

router.post("/forget-password", customValidator.postForgetPassword, accountController.postForgetPassword);

router.get("/email-confirm", accountController.getEmailConfirm);
router.post("/email-confirm", accountController.emailConfirm);

router.get("/logout", accountController.getLogout);

router.get("/logout-success", accountController.getLogoutSuccess);

module.exports = router;
