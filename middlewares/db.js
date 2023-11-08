
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        mongoose.set("strictQuery", false);
        const connect = await mongoose.connect(process.env.MONGODB_URI);
        mongoose.connection.on("connected", () => {
            console.log("[DB] Connected to DB successfully.");
        });
        mongoose.connection.on("error", (error) => {
            console.log(`[DB] Error while connecting to DB. ${error}`);
        });
        mongoose.connection.on("disconnected", () => {
            console.log("[DB] DB connection disconnected.");
        });

        console.log(`[DB] Database connected ${connect.connection.host}`);
    } catch (error) {
        console.log("[DB] error:", error);
    }
};

module.exports = connectDB;