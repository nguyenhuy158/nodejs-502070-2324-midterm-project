const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");
const { requireRole } = require("./authMiddleware");
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
    useNewUrlParser: true, useUnifiedTopology: true,
});

// Configure express-session middleware
app.use(session({
    secret: "secret-key", resave: false, saveUninitialized: false,
}));

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Configure passport-local strategy
passport.use(new LocalStrategy(async function (username, password, done) {
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
}));

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
app.get("/login", function (req, res) {
    res.render("login", {
        messages: req.flash(),
    });
});

// Route for user registration form
app.get("/register", function (req, res) {
    res.render("register");
});

// Route for handling user registration
// Route for handling user registration
app.post("/register", function (req, res, next) {
    const { username, password } = req.body;
    
    // Check if username already exists
    User.findOne({ username: username })
        .then((existingUser) => {
            if (existingUser) {
                req.flash('error', 'User')
                return res.render("register", { error: "Username already exists." });
            }
            
            // Create a new user
            const newUser = new User({
                username: username, password: password,
            });
            
            // Save the user to the database
            return newUser.save();
        })
        .then(() => {
            return res.redirect("/login");
        })
        .catch((err) => {
            console.error(err);
            next(err);
        });
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: true,
    failureMessage: "Invalid username or password.",
    successMessage: "Logged in successfully.",
}));

// Define the authentication middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the next middleware/route handler
    }
    // User is not authenticated, redirect to the login page
    res.redirect("/login");
}

// Apply the authentication middleware to the "/dashboard" route
app.get("/dashboard", ensureAuthenticated, function (req, res) {
    console.log(`/dashboard ${req.user}`);
    res.render("dashboard");
});

app.get("/", ensureAuthenticated, function (req, res) {
    res.render("index");
});

app.get("/about", ensureAuthenticated, function (req, res) {
    res.render("about");
});

app.get("/contact", ensureAuthenticated, function (req, res) {
    res.render("contact");
});

app.get("/admin/dashboard", ensureAuthenticated, requireRole("admin"), (req, res) => {
    // Only users with the "admin" role can access this route
    res.render("adminDashboard"); // Render the permissionDenied.pug template
});

app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) {
            // Handle any errors that may occur during logout
            // You can redirect to an error page or do other error handling here
            res.redirect("/error");
        } else {
            // Successful logout
            res.redirect("/");
        }
    });
});

app.use(function (req, res, next) {
    res.status(404).render("404");
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).render("500");
});

app.listen(process.env.PORT, function () {
    console.log(`http://localhost:${process.env.PORT}`);
    
    console.log("Server started on port 3000");
});