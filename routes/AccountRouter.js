const express = require("express");
const router = express.Router();
const session = require("express-session");
const AccountController = require("../controllers/accountController");
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

router.get("/login", AccountController.isNotAuthenticated, doubleCsrfProtection, AccountController.getLogin);

router.post("/login", customValidator.postLogin, doubleCsrfProtection, AccountController.postLogin);

router.get("/register", AccountController.isNotAuthenticated, AccountController.getRegister);

router.post("/register", customValidator.postRegister, AccountController.postRegister);

router.get("/forget-password", AccountController.isNotAuthenticated, AccountController.getForgetPassword);

router.post("/forget-password", customValidator.postForgetPassword, AccountController.postForgetPassword);

router.get("/logout", AccountController.getLogout);

router.get("/logout-success", AccountController.getLogoutSuccess);

module.exports = router;
