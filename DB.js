// connectDB.js
import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return;

    try {
        await mongoose.connect(process.env.DATABASE_URL//, {
            //     useNewUrlParser: true,
            //     useUnifiedTopology: true,
            // }
        );
        isConnected = true;
        console.log("MongoDB connected");
    } catch (err) {
        console.error("DB connection error:", err.message);
    }

};
