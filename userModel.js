const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" }
});


userSchema.pre("save", async function (next) {
    try {
        const user = this;
        
        // Only hash the password if it's new or modified
        if (!user.isModified("password")) {
            return next();
        }
        
        // Generate a salt for the hash
        const salt = await bcrypt.genSalt(10);
        
        // Hash the password with the salt
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        // Replace the plain text password with the hashed password
        user.password = hashedPassword;
        
        return next();
    } catch (error) {
        return next(error);
    }
});

userSchema.methods.validPassword = async function (password) {
    try {
        console.log(password);
        console.log(this.password);
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw error;
    }
};

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);