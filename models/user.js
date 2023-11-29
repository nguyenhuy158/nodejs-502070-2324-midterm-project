const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
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
}, {
    timestamps: true,
});

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
    return await bcrypt.compare(password, this.password);
};

userSchema.virtual("createdAtFormatted").get(function () {
    return moment(this.createdAt).format(process.env.DATETIME_FORMAT_FULL);
});

userSchema.virtual("updatedAtFormatted").get(function () {
    return moment(this.updatedAt).format(process.env.DATETIME_FORMAT_FULL);
});

userSchema.methods.display = function () {
    return `${this.fullName} (${this.username})`;
};

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
