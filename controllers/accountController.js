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

exports.getChangepassword = (req, res) => {
    res.render("reset-password");
};

exports.postChangepassword = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.session.user._id);
        console.log(`🚀 🚀 file: accountController.js:79 🚀 exports.postChangepassword= 🚀 user`, user);

        user.password = password;
        user.isPasswordReset = false;
        await user.save();
        req.session.user = user;
        res.json({ error: false, message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: 'An error occurred while updating the password' });
    }
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

exports.postForgetPassword = async (req, res) => {
    const result = validationResult(req);
    console.log(`exports.postForgetPassword= 🚀  req.body`, req.body);

    if (result.errors.length === 0) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (user) {
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

                res.json({
                    error: false,
                    message: 'Reset success, please check mail to login.',
                });
            } else {
                res.json({
                    error: true,
                    message: 'No user found with this email.'
                });
            }
        } catch (error) {
            res.json({
                error: true,
                message: 'An error occurred.' + error,
            });
        }
    } else {
        return res.json({ error: true, message: result.errors[0].msg });
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

exports.getEmailConfirm = (req, res) => {
    res.render("email-confirm");
};

exports.emailConfirm = async (req, res) => {
    const token = req.query.token;

    if (token) {
        try {
            const salesperson = await User.findOne({ token });

            if (!salesperson) {
                console.log(`🚀 🚀 file: accountController.js:154 🚀 exports.emailConfirm= 🚀 salesperson`, salesperson);
                return res.json({
                    error: true,
                    message: 'Link invalid or used, please contact to admin and try again.'
                });
            }

            if (salesperson && salesperson.tokenExpiration < moment()) {
                return res.json({
                    error: true,
                    message: 'Link expired, please contact to admin and try again.'
                });
            }

            // Set the user in the session
            req.session.user = salesperson;
            req.session.loggedin = true;
            req.session.email = salesperson.email;
            req.session.username = salesperson.username;

            salesperson.token = undefined;
            salesperson.tokenExpiration = undefined;
            await salesperson.save();

            return res.json({
                error: false,
                message: 'Welcome Now you are salespeople.'
            });
        } catch (error) {
            return res.json({
                error: true,
                message: 'An error occurred while logging in.'
            });
        }
    } else {
        return res.json({
            error: true,
            message: 'No token provided.'
        });
    }
};