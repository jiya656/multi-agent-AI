// server.js
//
// Day 1: prove the backend runs and can talk to the frontend.
// Day 2: connect to MongoDB and prove we can save real data.
// Day 3: real authentication (register, login, JWT-protected routes).
// Day 5: chat system (conversations + messages).

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const { connectRedis } = require("./config/redis"); 
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const documentRoutes = require("./routes/documentRoutes");
const http = require("http");
const { Server } = require("socket.io");
const { subscriber, connectSubscriber } = require("./config/redisPubSub");
const errorMiddleware = require("./middleware/errorMiddleware");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
// The one browser origin allowed to call the API / open sockets.
// In production (everything behind one domain) this is that domain.
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: { origin: CLIENT_URL }
});

// Every socket must present a valid JWT (same secret as the REST API).
// A socket that can't prove who it is never connects.
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error("Not authorized"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Not authorized"));
  }
});

io.on("connection", (socket) => {
  // Each user listens only in their own room.
  socket.join(`user:${socket.userId}`);
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

// Lets our React app (CLIENT_URL) call this server from the browser.
app.use(cors({ origin: CLIENT_URL }));
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

// Day 5: every route in chatRoutes.js is protected by JWT and mounted
// under /api/chats — so router.post("/", ...) becomes POST /api/chats,
// router.post("/:id/messages", ...) becomes POST /api/chats/:id/messages, etc.
app.use("/api/chats", chatRoutes);

// Day 26: every route in documentRoutes.js is protected by JWT (same
// `protect` pattern as chatRoutes.js) and mounted under /api/documents —
// so router.post("/upload", ...) becomes POST /api/documents/upload.
app.use("/api/documents", documentRoutes);

// 404 — must come after all real routes, so only truly unmatched
// requests fall through to here
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Centralized error handler — must be the LAST app.use() in the file.
// Express identifies this as error-handling middleware specifically
// because it takes 4 parameters (err, req, res, next); any call to
// next(err) or an asyncHandler-wrapped controller's rejected promise
// lands here.
app.use(errorMiddleware);

Promise.all([connectDB(), connectRedis(), connectSubscriber()]).then(async () => {
    await subscriber.subscribe("document-status", (message) => {
    const { documentId, status, userId } = JSON.parse(message);
    console.log("[pubsub] document status:", { documentId, status });

    // An event with no owner is dropped, never broadcast.
    if (!userId) return;
    io.to(`user:${userId}`).emit("document:status", { documentId, status });
  });

  server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
  });
});