const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    products: [
        {
            product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, default: 1 },
            unitPrice: { type: Number, required: true },
        },
    ],
    totalAmount: { type: Number, required: true },
    givenAmount: { type: Number, required: true },
    changeAmount: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Order", orderSchema);

