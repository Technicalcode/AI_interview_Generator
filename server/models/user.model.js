const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true, // Prevents duplicate accounts
        lowercase: true,
        trim: true
    },
    credits: {
        type: Number,
        default: 100 // Default starting credits for new users
    }
}, {
    timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
});

const User = mongoose.model("User", userSchema);

module.exports = User;