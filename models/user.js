import mongoose, { Schema } from "mongoose";
import passportLocalMongoose from 'passport-local-mongoose'

const userSchema = new Schema({
    username : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    }

});

userSchema.plugin(passportLocalMongoose, {usernameField: "email"});

// export const User = mongoose.model("User", userSchema);
export const User = mongoose.models.User || mongoose.model("User", userSchema);


