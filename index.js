import 'dotenv/config'
import express from "express";
import cors from "cors";
import fs  from "fs";
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import multer from 'multer'
import passport from 'passport';
import session from 'express-session';
import { Strategy as LocalStrategy } from 'passport-local';


import { User } from './module/user.js';
import { cloudinary } from './utils/cloudinary.js';
import { connectDB } from './DB.js'

const app = express();

// connected to DB
await connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


// mongoDb session store
const sessionStore = MongoStore.create({
    mongoUrl: process.env.DATABASE_URL,
    crypto: {
        secret: process.env.SESSION_SECRET
    },
    touchAfter: 24 * 3600
});

sessionStore.on('error', (err) => {
    console.log('Error in MONGO SESSION STORE', err);
});


// express-session
app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
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

// Ensure uploads directory exists
const uploadFile = "./public/uploads";
if(!fs.existsSync(uploadFile)) {
    fs.mkdirSync(uploadFile, {recursive: true});
}

// multer disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFile);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({storage})


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
// app.post("/logout", (req, res) => {

// })

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
    
    if(!req.file) return res.status(400).json({error: 'No file provided'});

    console.log(req.file);
    const localFilePath = req.file.path;

    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });


        // delete local file after successful upload on cloud
         fs.unlinkSync(localFilePath); 

        return res.status(200).json({ 
            message: "file uploaded successfully",  
            url: result.secure_url,
        });
 
    } catch (err) {
        fs.unlinkSync(localFilePath);
        res.status(500).json({error: err || "file upload failed"});
    }

})


// Export handler for Vercel
export default app;


// server listen
// let port = process.env.PORT
// app.listen(port, () => {
//     console.log(`server is running on localhost ${port}`);
// });