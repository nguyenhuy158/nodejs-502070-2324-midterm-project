const User = require("../models/user");
const { faker } = require("@faker-js/faker");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const { cookieOptions } = require("../config/config");
const { generateToken, sendEmail } = require("../middlewares/utils");
const { sentMail } = require("./routerController");
require("dotenv").config();

exports.ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

exports.checkAdmin = async function (req, res, next) {
    const currentRole = req.session.user.role;
    if (currentRole != process.env.ROLE_ADMIN) {
        return res.redirect("/permission-denied");
    }
    next();
};

exports.logger = async function (req, res, next) {
    const timestamp = moment().format("DD/MM/yyyy HH:mm");
    console.log("Timestamp: ", timestamp);
    next();
};

exports.get = async function (req, res, next) {
    
    const { token } = req.query;
    
    if (token) {
        try {
            const salesperson = await User.findOne({ token });
            
            if (!salesperson || salesperson.tokenExpiration < moment()) {
                // flash.addFlash(
                //     req,
                //     "warning",
                //     "Please login by clicking on the link in your email."
                // );
                return res.redirect("/login");
            }
            
            salesperson.token = undefined;
            salesperson.tokenExpiration = undefined;
            await salesperson.save();
            
            // flash.addFlash(req, "success", "Welcome Now you are salespeople.");
            
            const token = salesperson.generateAccessJWT();
            res.cookie(process.env.COOKIE_NAME, token, cookieOptions);
            
            res.redirect("/");
        } catch (error) {
            // flash.addFlash(req, "warning", "An error occurred while logging in.");
            next(error);
        }
    } else {
        return res.render("pages/auth/form", {
            messages: req.flash("info"),
        });
    }
};

exports.passwordResetGet = async (req, res, next) => {
    return res.render("pages/auth/password-reset");
};

exports.passwordReset = async (req, res, next) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.render("pages/auth/password-reset", { email });
        }
        
        const resetToken = generateToken();
        const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
        
        user.token = resetToken;
        user.tokenExpiration = resetTokenExpires;
        user.isPasswordReset = true;
        user.isFirstLogin = false;
        await user.save();
        
        const resetLink = `${req.protocol + "://" + req.get("host")}/email-confirm?token=${resetToken}`;
        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to: email,
            subject: "Password Reset Request",
            text: `You are receiving this email because you (or someone else) requested a password reset for your account.\n\n`
                + `Please click on the following link, or paste this into your browser to reset your password:\n\n`
                + resetLink
        };
        sendEmail(req, user, resetToken, mailOptions);
        req.flash("success", "Reset success, please check mail to login.");
        res.redirect("/login");
    } catch (error) {
        console.log("=>(authController.js:104) error", error);
        next(error);
    }
};

exports.emailConfirm = async (req, res, next) => {
    const token = req.query.token;
    console.log("=>(authController.js:70) token", token);
    
    if (token) {
        try {
            const salesperson = await User.findOne({ token });
            
            if (!salesperson) {
                req.flash("info", "Link invalid, please try again.");
                return res.redirect("/login");
            }
            
            if (salesperson && salesperson.tokenExpiration < moment()) {
                req.flash("info", "Link expired, please try again. ");
                return res.redirect("/login");
            }
            
            req.login(salesperson, async (err) => {
                console.log("=>(authController.js:138) err", err);
                if (err) {
                    return next(err);
                }
                req.flash("info", "Welcome Now you are salespeople.");
                
                salesperson.token = undefined;
                salesperson.tokenExpiration = undefined;
                await salesperson.save();
                return res.redirect("/");
            });
            
        } catch (error) {
            req.flash("error", "An error occurred while logging in.");
            next(error);
        }
    } else {
        return res.redirect("/login");
    }
};

exports.createUser = async function (req, res, next) {
    const { email } = req.body;
    try {
        const newUser = new User({
            email,
            username: req.body.username,
            password: req.body.password,
            role: "salespeople",
        });
        
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.render("pages/auth/form", {
                isRegister: true,
                status: "failed",
                data: [],
                message: "It seems you already have an account, please log in instead.",
            });
        }
        
        const savedUser = await newUser.save();
        const { password, role, ...user_data } = savedUser._doc;
        return res.redirect("/login");
    } catch (err) {
        next(err);
    }
};

exports.checkUser = async function (req, res, next) {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username }).select("+password");
        
        if (user) {
            if (!user.lockedStatus) {
                if (user.token) {
                    if (moment(user.tokenExpiration).isBefore(moment())) {
                        // flash.addFlash(
                        //     req,
                        //     "warning",
                        //     `You can ask the administrator's support to resend another email with another link.`
                        // );
                        return res.redirect("/login");
                    } else {
                        // flash.addFlash(
                        //     req,
                        //     "warning",
                        //     "Please login by clicking on the link in your email."
                        // );
                        return res.redirect("/login");
                    }
                } else if (await bcrypt.compare(password, user.password)) {
                    // req.session.loggedIn = true;
                    // req.session.user = user;
                    // req.session.userId = user._id;
                    //
                    // req.app.locals.user = user;
                    //
                    const token = user.generateAccessJWT();
                    console.log("=>(authController.js:123) token", token);
                    console.log("=>(authController.js:155) res.cookie", res.cookies);
                    res.cookie(process.env.COOKIE_NAME, token, cookieOptions);
                    console.log("=>(authController.js:155) res.cookie", res.cookies);
                    return res.redirect("/");
                }
            } else {
                return res.render("pages/auth/form", {
                    username,
                    password,
                    error: `You can contact the administrator's support unlock account link.`,
                });
            }
        }
        
        return res.render("pages/auth/form", {
            username,
            password,
            error: "Username or Password is not correct",
        });
    } catch (err) {
        console.error("Error finding user:", err);
        next(err);
    }
};

exports.logout = function (req, res, next) {
    
    req.logout(function (err) {
        if (err) {
            res.redirect("/error");
        } else {
            req.flash("info", "Logout successfully.");
            req.session = null;
            res.locals = null;
            res.clearCookie(process.env.COOKIE_NAME);
            res.cookies = null;
            res.redirect("/login");
        }
    });
};

exports.getRegister = async function (req, res, next) {
    res.render("pages/auth/form", { isRegister: true });
};

exports.changePassword = async function (req, res, next) {
    console.log("=>(authController.js:257) req.user.isPasswordReset", req.user.isPasswordReset);
    if (req.user.isPasswordReset) return res.render("pages/auth/change-password", { isReset: true });
    return res.render("pages/auth/change-password");
};

exports.postChangePassword = async function (req, res, next) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    try {
        const user = req.user;
        
        if (!user.isPasswordReset) {
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            
            if (!isPasswordValid) {
                req.flash("error", "Change password fail: Password is not correct.");
                return res.status(401).redirect("/change-password");
            }
        }
        
        if (newPassword !== confirmPassword) {
            req.flash("error", "Change password fail: Password not match.");
            return res.status(400).redirect("/change-password");
        }
        
        user.password = newPassword;
        user.isFirstLogin = false;
        user.isPasswordReset = false;
        await user.save();
        req.session.user = user;
        req.flash("success", "Change password success: Password changed.");
        res.redirect("/");
    } catch (error) {
        console.log("=>(authController.js:285) error", error);
        next(error);
    }
};
