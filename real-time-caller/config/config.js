const cookieSession = require("cookie-session");
const path     = require("path");
const fs       = require("fs");
const rateLimit = require("express-rate-limit");
const passport = require("passport");

module.exports = {
    port                      : process.env.PORT || 3000,
    database                  : {
        url: process.env.DB_URL || "mongodb://localhost/techhut",
        username: process.env.DB_USERNAME || "user",
        password: process.env.DB_PASSWORD || "password",
    },
    email                     : {
        host    : process.env.EMAIL_HOST,
        port    : process.env.EMAIL_PORT,
        service : process.env.EMAIL_SERVICE,
        username: process.env.EMAIL_USERNAME,
        password: process.env.EMAIL_PASSWORD
    },
    jwtSecret                 : process.env.JWT_SECRET || "your-secret-key",
    cookieSessionConfig       : cookieSession({
                                                  name    : process.env.COOKIE_SESSION_NAME,
                                                  keys    : [process.env.COOKIE_SESSION_SECRET],
                                                  httpOnly: true,
                                              }),
    cookieOptions             : {
        maxAge  : 20 * 60 * 1000,
        httpOnly: true,
        secure  : true,
        sameSite: "None",
    },
    staticOptions             : {
        dotfiles: "ignore",
        etag  : false,
        extensions: ["htm", "html", "css"],
        index : false,
        maxAge: "1d",
        redirect: false,
        setHeaders(res, path, stat) {
            res.set("x-timestamp", Date.now());
        }
    },
    sassOptions               : {
        src   : path.join("..", "source", "sass"),
        dest  : path.join("..", "public", "css"),
        debug : false,
        outputStyle: "compressed",
        force : true,
        root  : __dirname,
        indentedSyntax: false,
        prefix: "/css"
    },
    morganOptions             : {
        stream: fs.createWriteStream(path.join(__dirname, process.env.MORGAN_LOG), { flags: "a" })
    },
    limiter                   : rateLimit({
                                              windowMs: +process.env.LIMIT_TIME * 60 * 1000,
                                              max     : +process.env.LIMIT_MAX_REQUEST_PER_LIMIT_TIME,
                                              message : process.env.LIMIT_MESSAGE
                                          }),
    passportAuthenticateConfig: {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: true,
        failureMessage: "Invalid username or password.",
        successMessage: "Logged in successfully.",
    },
    cloudinaryConfig          : {
        cloud_name: "techhut",
        api_key   : "111625936491283",
        api_secret: "wh9x7uDLH2d6-Wk6A7uN4Ea8qUQ"
    }
};
