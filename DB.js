// connectDB.js
import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return;

    // not nacessary
    if(!process.env.DATABASE_URL){
        console.log("database url not in env file");
        throw new Error("missing mongodb string")
    }

    try {
        await mongoose.connect(process.env.DATABASE_URL);
        isConnected = true;
        console.log("MongoDB connected");
    } catch (err) {
        console.error("DB connection error:", err.message);
        throw err;
    }

};
