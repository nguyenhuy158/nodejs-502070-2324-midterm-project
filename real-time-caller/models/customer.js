const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerSchema = new Schema({
    phone: { type: String, unique: true, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    address: { type: String, required: true },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Customer", customerSchema);