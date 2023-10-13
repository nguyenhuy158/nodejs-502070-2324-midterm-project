const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
require("dotenv").config();

// Import user model
const User = require("./userModel");

// Import the Pug view engine
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Configure express-session middleware
app.use(
    session({
        secret: "secret-key",
        resave: false,
        saveUninitialized: false,
    })
);

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure passport-local strategy
passport.use(
    new LocalStrategy(async function (username, password, done) {
        try {
            const user = await User.findOne({ username: username });
            
            if (!user) {
                return done(null, false, { message: "Incorrect username." });
            }
            
            const isPasswordValid = await user.validPassword(password);
            
            if (!isPasswordValid) {
                return done(null, false, { message: "Incorrect password." });
            }
            
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

// Serialize and deserialize user
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Routes
app.get("/", function (req, res) {
    res.render("index");
});

app.get("/login", function (req, res) {
    res.render("login");
});

// Route for user registration form
app.get("/register", function (req, res) {
    res.render("register");
});

// Route for handling user registration
// Route for handling user registration
app.post("/register", function (req, res) {
    const { username, password } = req.body;
    
    // Check if username already exists
    User.findOne({ username: username })
        .then((existingUser) => {
            if (existingUser) {
                return res.render("register", { error: "Username already exists." });
            }
            
            // Create a new user
            const newUser = new User({
                username: username,
                password: password,
            });
            
            // Save the user to the database
            return newUser.save();
        })
        .then(() => {
            return res.redirect("/login");
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).send("Internal Server Error");
        });
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
    })
);

app.get("/dashboard", function (req, res) {
    if (req.isAuthenticated()) {
        console.log(`/dashboard ${req.id}`)
        console.log(`/dashboard ${req.user}`)
        res.render("dashboard", {data: req.id});
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

// Start the server
app.listen(process.env.PORT, function () {
    console.log(`http://localhost:${process.env.PORT}`);
    
    console.log("Server started on port 3000");
});