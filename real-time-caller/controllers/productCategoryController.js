const ProductCategory = require("../models/productCategory");


exports.categories = () => ProductCategory.find()
                                          .sort({ name: 1 });