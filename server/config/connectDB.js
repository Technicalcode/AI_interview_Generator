const mongoose = require("mongoose"); // database se connect kra iss file me

const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGO_DB || process.env.mango_url;

        if (!mongoUrl) {
            throw new Error("Missing MongoDB connection string. Set MONGO_DB in server/.env.");
        }

        const conn = await mongoose.connect(mongoUrl);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
