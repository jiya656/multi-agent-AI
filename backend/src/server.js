// server.js
//
// Day 1: prove the backend runs and can talk to the frontend.
// Day 2: connect to MongoDB and prove we can save real data.
// Day 3: real authentication (register, login, JWT-protected routes).

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");

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

// Day 3: every route inside authRoutes.js is now mounted under /api/auth,
// so router.post("/register", ...) becomes POST /api/auth/register, and
// router.get("/profile", ...) becomes GET /api/auth/profile.
// This replaces the Day 2 temporary /api/test/users route entirely.
app.use("/api/auth", authRoutes);

// Connect to MongoDB FIRST, and only start accepting requests once that
// succeeds. If the database isn't reachable, we don't want a backend that
// looks alive but fails on every real request.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
});