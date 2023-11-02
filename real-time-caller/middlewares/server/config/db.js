require("dotenv")
    .config();
const mongoose = require("mongoose");
const User = require("../../../models/user");
const ProductCategory = require("../../../models/productCategory");

const connectDB = async (req, res, next) => {
    try {
        mongoose.set("strictQuery", false);
        const connect = await mongoose.connect(process.env.MONGODB_URI);
        mongoose.connection.on("connected", () => {
            console.log("[db] Connected to DB successfully.");
        });
        mongoose.connection.on("error", (error) => {
            console.log(`[db] Error while connecting to DB. ${error}`);
        });
        mongoose.connection.on("disconnected", () => {
            console.log("[db] DB connection disconnected.");
        });
        
        console.log(`[db] Database connected ${connect.connection.host}`);
        checkAndCreateAdminUser();
        checkAndCreateDefaultCategory();
        next();
    } catch (error) {
        console.log("[db] error:", error);
        next(error);
    }
};

async function checkAndCreateDefaultCategory() {
    try {
        const phoneCategoryExists = await ProductCategory.exists({ name: "Phone" });
        
        const accessoriesCategoryExists = await ProductCategory.exists({ name: "Accessories" });
        
        if (!phoneCategoryExists) {
            const phoneCategory = new ProductCategory({
                                                          name       : "Phone",
                                                          description: "Category for mobile phones and smartphones",
                                                      });
            await phoneCategory.save();
        }
        
        if (!accessoriesCategoryExists) {
            const accessoriesCategory = new ProductCategory({
                                                                name       : "Accessories",
                                                                description: "Category for various accessories for electronic devices",
                                                            });
            await accessoriesCategory.save();
        }
        
        console.log("Product categories created or checked successfully.");
    } catch (error) {
        console.error("Error creating/checking product categories:", error);
    }
}

async function checkAndCreateAdminUser() {
    try {
        const adminUser = await User.findOne({ username: process.env.DEFAULT_ACCOUNT_USERNAME_ADMIN });
        if (!adminUser) {
            const newUser = new User({
                                         email           : process.env.EMAIL_USERNAME,
                                         username        : process.env.DEFAULT_ACCOUNT_USERNAME_ADMIN,
                                         fullName        : process.env.APP_NAME,
                                         role            : process.env.ROLE_ADMIN,
                                         isFirstLogin    : false,
                                         password        : process.env.DEFAULT_ACCOUNT_PASSWORD_ADMIN,
                                         password_confirm: process.env.DEFAULT_ACCOUNT_PASSWORD_ADMIN,
                                         token           : undefined,
                                         tokenExpiration : undefined,
                                     });
            
            await newUser.save();
            console.log("[db] Admin user created.");
        } else {
            console.log("[db] Admin user already exists.");
        }
    } catch (err) {
        console.error("[db] Error checking/creating admin user:", err);
    } finally {
    }
}

module.exports = connectDB;