const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productCategorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
}, {
    timestamps: true,
});

module.exports = mongoose.model("ProductCategory", productCategorySchema);