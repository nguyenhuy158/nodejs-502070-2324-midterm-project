const User = require("../models/user");
const { generateToken, sendEmail } = require('../utils/utils');
const moment = require('morgan');

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

    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    if (result.errors.length === 0) {
        const savedUser = await createAccount(name, email, password);
        if (savedUser) {
            return res.json({ error: false, message: 'User created successfully' });
        } else {
            return res.json({ error: true, message: 'User creation failed' });
        }
    } else {
        return res.json({
            error: true,
            message: result.errors[0].msg
        });
    }
};

exports.postLogin = async (req, res) => {
    const result = validationResult(req);

    if (result.errors.length === 0) {
        let email = req.body.email;
        let password = req.body.password;

        const user = await User.findOne({ email: email });

        if (user) {
            const isPasswordValid = await user.validPassword(password);
            if (isPasswordValid) {
                req.session.user = user;
                req.session.loggedin = true;
                req.session.email = email;
                req.session.username = user.username;
                return res.json({ error: false, message: 'Login successful' });
            }
        }
        return res.json({ error: true, message: 'Email or password not correct!' });
    } else {
        return res.json({ error: true, message: result.errors[0].msg });
    }
};

exports.getLogout = (req, res) => {
    req.session.destroy((err) => {
        // console.log(`🚀 🚀 file: accountController.js:85 🚀 req.session.destroy 🚀 err`, err);
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
        // console.log('=>(authController.js:104) error', error);
        next(error);
    }
};

exports.isNotAuthenticated = (req, res, next) => {
    // console.log("[LOGIN] -> ");
    if (req.session.loggedin) {
        res.redirect("/");
    } else {
        next();
    }
};

exports.emailConfirm = async (req, res, next) => {
    const token = req.query.token;
    // console.log('=>(authController.js:70) token', token);

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
                // console.log('=>(authController.js:138) err', err);
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