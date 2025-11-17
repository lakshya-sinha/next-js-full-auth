import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({

    fullName: {
        type:String,
        required: [true, "Please provide a username"],
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
    
})


//? Creating Model
const User =  mongoose.models.users || mongoose.model("users", userSchema);


//! exporting Model 
export default User;