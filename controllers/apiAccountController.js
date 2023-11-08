const User = require("../models/user");

const {
    query,
    body,
    param,
    validationResult
} = require("express-validator");

async function createAccount(name, email, password) {
    const user = new User({
        fullName: name,
        email,
        password
    });
    const savedUser = await user.save();
    return savedUser;
}

exports.postRegister = async (req, res, next) => {
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
        res.clearCookie("connect.sid");
        res.redirect("/logout-success");
    });
};

exports.getLogoutSuccess = (req, res) => {
    res.render("logout");
};

exports.getRegister = (req, res, next) => {
    res.render("register");
};

exports.getLogin = (req, res, next) => {
    res.render("login", { csrf: req.csrfToken() });
};

exports.getForgetPassword = (req, res, next) => {
    res.render('forget-password');
};
exports.isNotAuthenticated = (req, res, next) => {
    console.log("[LOGIN] -> ");
    if (req.session.loggedin) {
        res.redirect("/");
    } else {
        next();
    }
};