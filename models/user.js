const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const { formatTimestamp } = require("../utils/format");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema(
    {
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            trim: true,
            minlength: 1,
        },
        fullName: {
            type: String,
            trim: true,
            minlength: 2,
        },
        password: {
            type: String,
            trim: true,
            minlength: 1,
        },
        token: { type: String },
        tokenExpiration: { type: Date },
        isPasswordReset: {
            type: Boolean,
            default: false,
        },
        profilePicture: { type: String },
        settings: {
            darkMode: {
                type: Boolean,
                default: false,
            },
            notification: {
                type: Boolean,
                default: true,
            },
            language: {
                type: String,
                default: "en",
            },
            fontSize: {
                type: Number,
                default: 16,
            },
        },
    },
    {
        timestamps: true,
    },
);

userSchema.methods.updateProfilePicture = function (newProfilePicture) {
    this.profilePicture = newProfilePicture;
    return this.save();
};

userSchema.pre("save", function (next) {
    const user = this;

    if (!user.username) {
        const emailParts = user.email.split("@");
        if (emailParts.length > 0) {
            user.username = emailParts[0];
        }
    }

    if (!user.isModified("password")) {
        return next();
    }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }

            user.password = hash;
            next();
        });
    });
});

userSchema.methods.validPassword = async function (password) {
    // console.log("=>(user.js:66) password", password);
    // console.log("=>(user.js:68) this.password", this.password);
    // console.log("=>[user.js::68] await bcrypt.compare(password, this.password)", await bcrypt.compare(password, this.password));
    return await bcrypt.compare(password, this.password);
};

userSchema.virtual("createdAtFormatted").get(function () {
    return formatTimestamp(this.createdAt);
});

userSchema.virtual("updatedAtFormatted").get(function () {
    return formatTimestamp(this.updatedAt);
});

userSchema.methods.display = function () {
    return `${this.fullName} (${this.username})`;
};

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
