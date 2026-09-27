// worker.js
//
// Day 36: this runs as a SEPARATE Node process from server.js (started
// with `npm run worker`, not part of the API server). It needs its own
// MongoDB connection — Mongoose connections aren't shared across
// processes, only within one. Without this, documentWorker.js's
// Document.findByIdAndUpdate() calls buffer forever waiting for a
// connection that never comes, then time out after 10 seconds.

require("dotenv").config();

const connectDB = require("./src/config/database");
require("./src/jobs/workers/documentWorker");

connectDB().then(() => {
  console.log("Document worker started");
});