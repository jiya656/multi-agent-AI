// Message.js
//
// Each message is its own document, linked back to a Conversation via a
// reference (see the "why separate Conversation and Message" note in
// chatController.js for the reasoning).

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system", "tool"], // "system"/"tool" reserved for the agent work coming later
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt is what we sort messages by within a conversation
  }
);

module.exports = mongoose.model("Message", messageSchema);