// Document.js
// Day 26: tracks uploaded PDFs at the application level (MongoDB).
// The corresponding chunks/vectors live in Qdrant, keyed by this
// document's _id — same separation as Day 19's notes on MongoDB
// (application data) vs Qdrant (vector data).

const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // upload route requires auth (protect), so this is always known
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);