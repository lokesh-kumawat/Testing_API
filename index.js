import 'dotenv/config'
import express from "express";
import cors from "cors";
import fs from "fs";
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import session from 'express-session';
import { Strategy as LocalStrategy } from 'passport-local';


import { User } from './models/user.js';
import { cloudinary } from './utils/cloudinary.js';
import { connectDB } from './DB.js'
import { upload } from "./middleware/multer.middleware.js"

const app = express();

// connected to DB
await connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors());
app.use(cors({
  origin: 'http://192.168.0.190:5500', // your front-end IP + port
  credentials: true                    // allow cookies to be sent
}));


// mongoDb session store
const sessionStore = MongoStore.create({
    mongoUrl: process.env.DATABASE_URL,
    crypto: {
        secret: process.env.SESSION_SECRET
    },
    touchAfter: 24 * 3600
});

// express-session
app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
        
    }
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// passport local strategy
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/log", (req, res) => {
    res.send('lakjsdlls')
})

// register user router
app.post("/api/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "user is already exits" });
        }

        const user = new User({ username, email });
        // handle password hasing
        const registeredUser = await User.register(user, password)

        return res.status(200).json({ message: "user created successfully", user: registeredUser });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});


// login router 
app.post("/api/login",
    passport.authenticate('local', {
        failureMessage: "invalid credentials"
    }),
    (req, res) => {
        res.json({ message: "Loggend In", user: req.user });
    });

// logout user 
app.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.session.destroy((err) => {
            if (err) {
                next(err)
            }
            res.clearCookie("connect.sid");
            return res.status(200).json({ message: "logged out successfully" });
        });
    });
})

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


// upload photos and videos 
app.post("/upload", upload.single("file"), async (req, res) => {

    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    console.log(req.file);
    const localFilePath = req.file.path;

    try {
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "Api_data"
        });


        // delete local file after successful upload on cloud
        fs.unlinkSync(localFilePath);

        return res.status(200).json({
            message: "file uploaded successfully",
            url: result.secure_url,
        });

    } catch (err) {
        fs.unlinkSync(localFilePath);
        res.status(500).json({ error: err.message || "file upload failed" });
    }

})


// Export handler for Vercel
export default app;


// server listen
// let port = process.env.PORT
// app.listen(port, () => {
//     console.log(`server is running on localhost ${port}`);
// });