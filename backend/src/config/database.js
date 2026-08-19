// database.js
//
// This file's ONLY job: connect our app to MongoDB. Keeping this separate
// from server.js means server.js doesn't need to know HOW we connect to
// the database, just that connectDB() will handle it.

const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI is not set. Check your .env file.");
    process.exit(1); // no point running a backend that can't reach its database
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;