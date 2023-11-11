const User = require("../models/user");
const { generateToken, sendEmail } = require('../utils/utils');
const moment = require('morgan')

const { query, body, param, validationResult } = require("express-validator");

async function createAccount(name, email, password) {
    const user = new User({
        fullName: name,
        email,
        password
    });
    const savedUser = await user.save();
    return savedUser;
}

exports.postRegister = async (req, res) => {
    const result = validationResult(req);
    console.log(`=>(AccountRouter.js:99) result`, result);
    console.log(`=>(AccountRouter.js:99) result.errors.length`, result.errors.length);

    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let passwordConfirmation = req.body.passwordConfirmation;
    if (result.errors.length === 0) {

        const savedUser = await createAccount(name, email, password);
        console.log("🚀 ~ file: index.js:50 ~ router.post ~ savedUser:", savedUser);
        if (savedUser) {
            return res.redirect("/login");
        }
    } else {
        console.log(`=>(AccountRouter.js:123) result.errors[0]`, result.errors[0]);
        return res.render("register", {
            ...{
                name,
                email,
                password,
                passwordConfirmation
            },
            error: result.errors[0].msg
        });
    }
};

exports.postLogin = async (req, res) => {
    const result = validationResult(req);
    console.log(`=>(AccountRouter.js:72) req.body`, req.body);

    if (result.errors.length === 0) {
        let email = req.body.email;
        let password = req.body.password;


        console.log(`=>(accountController.js:56) email`, email);
        console.log(`=>(accountController.js:57) password`, password);
        const user = await User.findOne({ email: email });
        console.log(`=>(accountController.js:58) user`, user);

        if (user) {
            const isPasswordValid = await user.validPassword(password);
            console.log(`=>(accountController.js:62) isPasswordValid`, isPasswordValid);
            if (isPasswordValid) {
                console.log(`🚀 🚀 file: accountController.js:67 🚀 exports.postLogin= 🚀 user`, user);
                req.session.user = user;
                req.session.loggedin = true;
                req.session.email = email;
                req.session.username = user.username;
                return res.redirect("/");
            }
        }
        return res.render("login", {
            error: "Email or password not correct!", csrf: req.csrfToken()
        });
    } else {
        return res.render("login", {
            error: result.errors[0].msg, csrf: req.csrfToken()
        });
    }
};

exports.getLogout = (req, res) => {
    req.session.destroy((err) => {
        console.log(`🚀 🚀 file: accountController.js:85 🚀 req.session.destroy 🚀 err`, err);
        res.clearCookie("connect.sid");
        res.redirect("/logout-success");
    });
};

exports.getLogoutSuccess = (req, res) => {
    res.render("logout");
};

exports.getRegister = (req, res) => {
    res.render("register");
};

exports.getLogin = (req, res) => {
    res.render("login", { csrf: req.csrfToken() });
};

exports.getForgetPassword = (req, res) => {
    res.render("forget-password");
};

exports.postForgetPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        const resetToken = generateToken();
        const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.token = resetToken;
        user.tokenExpiration = resetTokenExpires;
        user.isPasswordReset = true;
        user.isFirstLogin = false;
        await user.save();

        const resetLink = `${req.protocol + '://' + req.get('host')
            }/email-confirm?token=${resetToken}`;
        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to: email,
            subject: 'Password Reset Request',
            text:
                `You are receiving this email because you (or someone else) requested a password reset for your account.\n\n` +
                `Please click on the following link, or paste this into your browser to reset your password:\n\n` +
                resetLink,
        };
        sendEmail(req, user, resetToken, mailOptions);
        req.flash(
            'success',
            'Reset success, please check mail to login (if email exist).',
        );
        res.redirect('/login');
    } catch (error) {
        console.log('=>(authController.js:104) error', error);
        next(error);
    }
};

exports.isNotAuthenticated = (req, res, next) => {
    console.log("[LOGIN] -> ");
    if (req.session.loggedin) {
        res.redirect("/");
    } else {
        next();
    }
};

exports.emailConfirm = async (req, res, next) => {
    const token = req.query.token;
    console.log('=>(authController.js:70) token', token);

    if (token) {
        try {
            const salesperson = await User.findOne({ token });

            if (!salesperson) {
                req.flash(
                    'info',
                    'Link invalid or used, please contact to admin and try again.',
                );
                return res.redirect('/login');
            }

            if (salesperson && salesperson.tokenExpiration < moment()) {
                req.flash(
                    'info',
                    'Link expired, please contact to admin and try again.',
                );
                return res.redirect('/login');
            }

            req.login(salesperson, async (err) => {
                console.log('=>(authController.js:138) err', err);
                if (err) {
                    return next(err);
                }
                req.flash('info', 'Welcome Now you are salespeople.');

                salesperson.token = undefined;
                salesperson.tokenExpiration = undefined;
                await salesperson.save();
                return res.redirect('/');
            });
        } catch (error) {
            req.flash('error', 'An error occurred while logging in.');
            next(error);
        }
    } else {
        return res.redirect('/login');
    }
};