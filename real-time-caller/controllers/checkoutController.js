const { TimeSeriesBucketTimestamp } = require('redis');
const Customer = require('../models/customer');
const Cart = require('../models/customer');

exports.get = async (req, res, next) => {
    try {
        const carts = await Cart.find();
        console.log("🚀 ~ file: checkoutController.js:8 ~ exports.get= ~ carts:", carts);
        return res.render('pages/checkouts/home', { carts });
    } catch (error) {
        console.log("🚀 ~ file: checkoutController.js:8 ~ exports.get= ~ error:", error);
        next(error);
    }
};

exports.getCustomer = async (req, res, next) => {
    const { phone } = req.body;
    console.log("🚀 ~ file: checkoutController.js:9 ~ phone:", phone);

    // const customer = { phone };
    try {

        const customer = await Customer.findOne({ phone });
        res.json({
            error: false,
            customer,
            message: 'Get data success'
        });
    } catch (error) {
        console.log("🚀 ~ file: checkoutController.js:21 ~ error:", error);
        return res.json({
            error: true,
            message: error
        });
    }
};