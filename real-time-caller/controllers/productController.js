const Product         = require("../models/product");
const ProductCategory = require("../models/productCategory");
const { faker }       = require("@faker-js/faker");
const moment          = require("moment");
const { ObjectId }    = require("mongodb");
const mongoose       = require("mongoose");
const sharp           = require("sharp");
const path            = require("path");
const fs              = require("fs");
const {
          uploadImage,
          removeImageByUrl
      }              = require("../middlewares/utils");
const { categories } = require("./productCategoryController");


function product(productId) {
    return Product.findById(productId);
}

exports.add = async function (req, res, next) {
    res.render("pages/products/form", { categories: await categories() });
};

exports.create = async function (req, res, next) {
    const categories = await ProductCategory.find()
                                            .sort({ name: 1 });
    const {
              barcode,
              productName,
              importPrice,
              retailPrice,
              category
          }         = req.body;
    const imageUrls = await processImageUrlsBeforeStore(req.files);
    
    try {
        const product = new Product({
                                        barcode,
                                        productName,
                                        importPrice,
                                        retailPrice,
                                        imageUrls,
                                        category,
                                    });
        
        await product.save();
        
        console.log("Product saved:", product);
        
        res.json({
                     message: "Product saved successfully",
                     product: product
                 });
    } catch (error) {
        console.error("Error:", error);
        res.status(500)
           .json({
                     error  : true,
                     message: "Internal Server Error"
                 });
    }
};

exports.createV1 = async function (req, res, next) {
    const categories = await ProductCategory.find()
                                            .sort({ name: 1 });
    
    const productId = req.params.id;
    const {
              barcode,
              productName,
              importPrice,
              retailPrice,
              imageUrls,
              category,
              creationDate,
              lastUpdateDate,
          } = req.body;
    
    let product;
    
    try {
        
        if (productId) {
            // Editing an existing product
            product = await Product.findByIdAndUpdate(productId, {
                barcode,
                productName,
                importPrice,
                retailPrice,
                imageUrls: imageUrls.split("\n"), // Split image URLs by line breaks
                category,
                creationDate,
                lastUpdateDate,
            }, { new: true });
        } else {
            // Creating a new product
            product = new Product({
                                      barcode,
                                      productName,
                                      importPrice,
                                      retailPrice,
                                      imageUrls: imageUrls.split("\n"), // Split image URLs by line breaks
                                      category,
                                      creationDate,
                                      lastUpdateDate,
                                  });
            await product.save();
        }
        
        res.redirect("/products"); // Redirect to the product list page after submission
    } catch (error) {
        if (error.name === "ValidationError") {
            // Handle validation errors and send them to the view
            const errors = Object.values(error.errors)
                                 .map((e) => e.message);
            console.log("=>(productController.js:64) errors", errors);
            
            req.flash("info", errors);
            res.render("pages/products/form", {
                product,
                categories
            });
        } else {
            // Handle other errors
            console.error("Error:", error);
            next(error);
        }
    }
};

exports.update = async function (req, res, next) {
    
    const productId = req.params.id;
    
    const {
              productName,
              importPrice,
              retailPrice,
              category,
              desc
          } = req.body;
    
    try {
        if (productId) {
            product = await Product.findByIdAndUpdate(productId, {
                productName,
                importPrice,
                retailPrice,
                category,
                desc
            }, { new: true });
            console.log(`=>(productController.js:180) product`, product);
            req.flash("info", "Update products successfully");
            res.json({
                         error: false,
                         product
                     });
        }
    } catch (error) {
        if (error.name === "ValidationError") {
            
            const errors = Object.values(error.errors)
                                 .map((e) => e.message);
            console.log("=>(productController.js:64) errors", errors);
            
            req.flash("info", errors);
            res.json({
                         error  : true,
                         message: errors
                     });
        } else {
            console.error("Error:", error);
            res.setStatus(500)
               .json({
                         error  : true,
                         message: error
                     });
        }
    }
};

exports.edit = async function (req, res, next) {
    try {
        const categories = await ProductCategory.find()
                                                .sort({ name: 1 });
        
        const id = req.params.id;
        
        const product = await Product.findById({ _id: id });
        
        res.render("pages/products/form", {
            product,
            categories
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        next(error);
    }
};

exports.detail = async function (req, res, next) {
    
    try {
        const id = req.params.id;
        
        const product = await Product.findById({ _id: id });
        if (req.xhr) {
            return res.json({
                                error: false,
                                product
                            });
        } else {
            res.render("pages/products/detail", { product });
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        next(error);
    }
};


exports.delete = async function (req, res, next) {
    const id = req.params.id;
    console.log("=>(productController.js:203) id", id);
    
    if (!ObjectId.isValid(id)) {
        res.status(400)
           .json({
                     code   : 400,
                     success: false,
                     message: "Invalid ObjectId"
                 });
        return;
    }
    console.log("=>(productController.js:209) req.xhr", req.xhr);
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        console.log("=>(productController.js:213) deletedProduct", deletedProduct);
        
        if (deletedProduct) {
            req.flash("success", `Successfully deleted ${deletedProduct.productName}`);
            res.json({
                         code   : 200,
                         success: true,
                         message: "Product deleted successfully"
                     });
        } else {
            req.flash("error", `Product not found`);
            res.json({
                         code   : 404,
                         success: false,
                         message: "Product not found"
                     });
        }
    } catch (error) {
        req.flash("error", `Failed to delete for ${id}`);
        res.status(500)
           .json({
                     code   : 500,
                     success: false,
                     message: "Internal Server Error"
                 });
    }
};

exports.gets = async function (req, res, next) {
    const perPage = parseInt(req.query.perPage) || 10;
    let page = parseInt(req.query.page) || 1;
    
    try {
        
        // const products = await Product
        //     .aggregate([{ $sort: { creationDate: -1 } }])
        //     .skip(perPage * page - perPage)
        //     .limit(perPage)
        //     .exec();
        const products = await Product.find()
                                      .sort({ creationDate: -1 })
                                      .skip(perPage * page - perPage)
                                      .limit(perPage)
                                      .populate("category")
                                      .exec();
        
        const count = await Product.count();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        
        const output = {
            products,
            current : page,
            count,
            perPage,
            nextPage: hasNextPage ? nextPage : null
        };
        res.render("pages/products/list", {
            ...output,
            navLink: process.env.NAVBAR_PRODUCT
        });
        
    } catch (error) {
        console.error("Error fetching products:", error);
        next(error);
    }
};

exports.seedDatabaseV1 = async function () {
    const products = [];
    const phoneCategory = await ProductCategory.findOne({ name: "Phone" });
    const accessoriesCategory = await ProductCategory.findOne({ name: "Accessories" });
    
    for (let i = 0; i < 50; i++) {
        const product = {
            barcode    : faker.string.uuid(),
            productName: faker.commerce.productName(),
            importPrice: faker.number.int({
                                              min: 1000,
                                              max: 10000
                                          }),
            retailPrice: faker.number.int({
                                              min: 1000,
                                              max: 10000
                                          }),
            imageUrls  : [faker.image.url(), faker.image.url(), faker.image.url()],
            category   : faker.helpers.arrayElements([phoneCategory, accessoriesCategory])[0],
            creationDate: faker.date.past(),
            lastUpdateDate: faker.date.recent(),
        };
        products.push(product);
    }
    
    try {
        await Product.insertMany(products);
        console.log("Sample products inserted successfully.");
    } catch (err) {
        console.error("Error inserting sample products:", err);
    } finally {
    }
};

function processImageUrlsBeforeStore(files) {
    return Promise.all(files
                           .map((file) => file.path)
                           .map(async file => {
                               const parsedPath               = path.parse(file);
                               const fileNameWithoutExtension = parsedPath.name;
                               const newFilePath              = path.join(__dirname, "..", "public", `uploads/${fileNameWithoutExtension}.webp`);
                               
                               await sharp(file)
                                   .resize(200, 200, {
                                       fit               : sharp.fit.cover,
                                       withoutEnlargement: true
                                   })
                                   .webp({ quality: 80 })
                                   .toFile(newFilePath);
                               try {
                                   await fs.promises.access(newFilePath);
                                   await fs.promises.unlink(file);
                                   return await uploadImage(newFilePath);
                               } catch (err) {
                                   console.log("=>(productController.js:47) err", err);
                               }
                               
                               return newFilePath;
                           }));
}

exports.addThumbnails = async (req, res) => {
    const imageUrls = await processImageUrlsBeforeStore(req.files);
    const productId = req.params.id;
    console.log(`=>(productController.js:369) productId`, productId);
    try {
        const result = await Product.updateOne({ _id: productId }, { $push: { imageUrls: { $each: imageUrls } } });
        console.log(`=>(productController.js:371) result`, result);
        
        return res.json({
                            error: false,
                            result
                        });
    } catch (error) {
        console.log(`=>(productController.js:377) error`, error);
        return res.json({
                            error  : true,
                            message: error
                        });
    }
};

exports.removeThumbnails = async (req, res) => {
    const imageUrls = req.body.imageUrls;
    const productId = req.params.id;
    try {
        const result = await Product.updateOne({ _id: productId }, { $pull: { imageUrls: imageUrls } });
        console.log(`=>(productController.js:371) result`, result);
        await removeImageByUrl(imageUrls);
        
        return res.json({
                            error: false,
                            result
                        });
    } catch (error) {
        console.log(`=>(productController.js:377) error`, error);
        return res.json({
                            error  : true,
                            message: error
                        });
    }
};


exports.mainThumbnail = async (req, res) => {
    const productId = req.params.id;
    const value     = req.body.imageUrls;
    
    try {
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.json({
                                error  : true,
                                message: "Product not found"
                            });
        }
        
        const { imageUrls } = product;
        
        if (imageUrls.length < 2) {
            return res.json({
                                error  : true,
                                message: "There are not enough images to move"
                            });
        }
        
        const index = imageUrls.indexOf(value);
        if (index !== -1) {
            imageUrls.splice(index, 1);
            
            imageUrls.unshift(value);
        }
        
        product.markModified("imageUrls");
        await product.save();
        
        return res.json({
                            error  : false,
                            message: "Last image moved to the first position and saved"
                        });
    } catch (error) {
        return res.json({
                            error  : true,
                            message: "Error moving last image:" + error
                        });
    }
};