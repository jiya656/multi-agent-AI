// server.js
//
// Day 1 goal: prove the backend runs and can talk to the frontend.
// Nothing fancy yet — no database, no auth, no AI. Just Express.

const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
