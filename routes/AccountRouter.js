const dotenv = require("dotenv");
const express = require("express");
const router = express.Router();
const session = require("express-session");
const User = require("../models/user");
const AccountController = require("../controllers/accountController");
const customValidator = require("../middlewares/customValidator");
const {doubleCsrf} = require("csrf-csrf");

dotenv.config();
const secretKey = process.env.SECRET_KEY;

router.use(session({
    secret: secretKey, resave: false, saveUninitialized: true
}));

const {init, getAccount, createAccount} = require("../config/db");

const bcrypt = require("bcrypt");
const {defaultConfiguration} = require("express/lib/application");
const saltRounds = 10;
const myPlaintextPassword = "s0/\/\P4$$w0rD";
const someOtherPlaintextPassword = "not_bacon";


const doubleCsrfOptions = {
    getSecret: () => "Secret", cookieName: "_crsf", getTokenFromRequest: (req) => req.body._csrf,
};
const {invalidCsrfTokenError, generateToken, validateRequest, doubleCsrfProtection,} = doubleCsrf(doubleCsrfOptions);


router.get("/login", AccountController.isNotAuthenticated, doubleCsrfProtection, AccountController.getLogin);

router.post("/login", customValidator.postLogin, doubleCsrfProtection, AccountController.postLogin);

router.get("/register", AccountController.isNotAuthenticated, AccountController.getRegister);

router.post("/register", customValidator.postRegister, AccountController.postRegister);

router.get(
	'/forget-password',
	AccountController.isNotAuthenticated,
	AccountController.getForgetPassword,
);

router.post(
	'/forget-password',
	customValidator.postForgetPassword,
	AccountController.getForgetPassword,
);

router.get("/logout", AccountController.getLogout);

router.get("/logout-success", AccountController.getLogoutSuccess);

router.get("/data-tables", (req, res, next) => {
    res.render("data-tables");
});

router.get("/lazy", (req, res, next) => {
    res.render("lazy");
});

module.exports = router;
