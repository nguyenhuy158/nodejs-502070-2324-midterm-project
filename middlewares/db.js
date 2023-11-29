const mongoose = require("mongoose");

const logger = require("../config/logger");

const connectDB = async () => {
    try {
        mongoose.set("strictQuery", false);
        const connect = await mongoose.connect(process.env.MONGODB_URI);

        mongoose.connection.on("connected", () => {
            logger.info("[DB] Connected to DB successfully.");
        });
        mongoose.connection.on("error", (error) => {
            logger.error(`[DB] Error while connecting to DB. ${error}`);
        });
        mongoose.connection.on("disconnected", () => {
            logger.info("[DB] DB connection disconnected.");
        });

        logger.info(`[DB] Database connected ${connect.connection.host}`);
    } catch (error) {
        logger.error("[DB] error:", error);
    }
};

module.exports = connectDB;