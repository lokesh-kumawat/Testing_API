import 'dotenv/config'

import express from "express";
import cors from "cors"
import mongoose from 'mongoose';
import { User } from './module/user.js';

const app = express();

app.use(express.json());
app.use(cors())

async function main() {
    // await mongoose.connect('mongodb://127.0.0.1:27017/New_API');
    await mongoose.connect(process.env.DATABASE_URL);
}

main().then(() => console.log("connected to the database"))
    .catch((err) => console.log(err));



// to add user data
app.post("/api/user", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const newUser = new User({
            name: name,
            email: email,
            password: password
        });
        await newUser.save();

        res.status(201).json({ message: "user created successfully", user: newUser })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

// get user data
app.get("/api/user/:id", async (req, res) => {
    const { id } = req.params;

    // check id format or id in correct formate
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid user id formate" });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        return res.status(200).json(user);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

});


// Export handler for Vercel
export default app;

// server listen
// let port = process.env.PORT
// app.listen(port, () => {
//     console.log(`server is running on localhost ${port}`);
// });