// User.js
//
// Day 2 goal: just prove we can save structured data to MongoDB.
// No password hashing yet — that's Day 3, when this becomes real
// registration instead of a test endpoint.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // MongoDB will reject a second user with the same email
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    // Day 3: this will store a bcrypt HASH, never the plain password.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// mongoose.model("User", ...) creates a MongoDB collection called "users"
// (Mongoose automatically lowercases + pluralizes the model name).
module.exports = mongoose.model("User", userSchema);