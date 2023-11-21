const { transporter } = require("../config/email");
const { faker } = require("@faker-js/faker");

const emailData = {
    username: "Tech Hut",
    password: "Tech Hut",
};

exports.checkFirstLogin = (req, res, next) => {
    const user = req.user;

    if (user && (user.isFirstLogin || user.isPasswordReset)) {
        req.flash("info", "You need to change password to continue use system.");
        return res.redirect("/change-password");
    }

    next();
};

exports.sentMail = (req, res) => {
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: "quocanh01062002@gmail.com",
        subject: "TEST MESSAGE",
        html: compiledFunction(emailData)
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error:", error);
        } else {
            console.log("Email sent:", info.response);
        }
        res.redirect("/");
    });
};

exports.home = async (req, res) => {
    res.render("index", { username: req.session.username });
};

exports.room = (req, res) => {
    const roomName = req.params.roomName;
    res.render('room-call', { roomName, username: req.session.username });
};

exports.about = (req, res) => {
    res.render("pages/about", { navLink: "About" });
};

exports.permissionDenied = (req, res) => {
    res.render("pages/permission-denied");
};

const isFormSubmit = (req) => {
    return !(req.headers["x-requested-with"] === "XMLHttpRequest");
};

exports.isLoggedIn = (req, res, next) => {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/login');
    }
};

exports.checkResetLogin = (req, res, next) => {
    const user = req.session.user;
    // console.log(`🚀 🚀 file: indexController.js:288 🚀 user`, user);
    if (user && user.isPasswordReset) {
        req.flash("info", "You need to change password to continue use system.");

        return res.redirect("/reset-password");
    }
    next();
};