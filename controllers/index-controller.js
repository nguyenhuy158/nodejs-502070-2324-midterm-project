
// middleware to check if user is logged in
exports.isLoggedIn = (req, res, next) => {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/login');
    }
};

// middleware check user need to reset password
exports.checkResetLogin = (req, res, next) => {
    const user = req.session.user;
    // console.log(`🚀 🚀 file: indexController.js:288 🚀 user`, user);
    if (user && user.isPasswordReset) {
        req.flash("info", "You need to change password to continue use system.");

        return res.redirect("/reset-password");
    }
    next();
};

// middleware get home page
exports.getHomePage = async (req, res) => {
    res.render("index", {
        username: req.session.username,
        pageTitle: 'Call Mate'
    });
};

// middleware get room page
exports.getRoomPage = (req, res) => {
    const roomName = req.params.roomName;
    res.render('room-call', {
        roomName,
        username: req.session.username,
        pageTitle: 'Room - Call Mate'
    });
};
