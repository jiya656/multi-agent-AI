// server.js
//
// Day 1: prove the backend runs and can talk to the frontend.
// Day 2: connect to MongoDB and prove we can save real data.

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;

// Lets our React app (running on a different port, localhost:5173)
// make requests to this server. Without this, the browser blocks it.
app.use(cors());
app.use(express.json());

// A simple route to confirm the server is alive if you open it directly
// in the browser.
app.get("/", (req, res) => {
  res.send("Backend is working! 🎉");
});

// The route the React frontend will actually call.
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connected successfully 🚀" });
});

// ---- Day 2: temporary test route ----
// This is NOT real registration. There's no password hashing, no
// validation beyond what Mongoose gives us for free, and no auth.
// Its only purpose is to prove: Express -> Mongoose -> MongoDB actually
// saves data. This gets replaced by real /api/auth/register on Day 3.
app.post("/api/test/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are all required" });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    // err.code 11000 = MongoDB's "duplicate key" error, thrown here because
    // email is marked `unique: true` in the schema.
    if (err.code === 11000) {
      return res.status(409).json({ error: "A user with that email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong creating the user" });
  }
});

// Connect to MongoDB FIRST, and only start accepting requests once that
// succeeds. If the database isn't reachable, we don't want a backend that
// looks alive but fails on every real request.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
});