// Conversation.js
//
// A conversation is the "chat session" itself — think of it as one entry
// in the sidebar. It does NOT store the messages directly (see Message.js
// for why we split these into two models).

const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // lets us later do .populate("user") if we ever need the owner's details
      required: true,
    },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
  },
  {
    // Automatically adds + manages createdAt AND updatedAt for us —
    // updatedAt refreshes every time we .save() or use certain update
    // methods, which is exactly what we want for "most recently active
    // chat first" sidebar ordering.
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);