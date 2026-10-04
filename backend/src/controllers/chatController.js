// chatController.js
//
// Every function here assumes `protect` middleware has already run
// (see chatRoutes.js), so req.user.id is always available and trustworthy.
//
// Day 42: migrated to asyncHandler + AppError + zod validation.
// One deliberate exception: addMessage's AI-failure branch stays a
// manual res.json() rather than throw new AppError(...), because it
// needs to return the successfully-saved userMessage alongside the
// error — AppError only carries a message + status code. Centralized
// error handling and a manual response can coexist in the same
// asyncHandler-wrapped function.

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { getAIResponse } = require("../services/aiService");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");
const { chatSchema } = require("../validators/chatValidator");

// POST /api/chats
const createChat = asyncHandler(async (req, res) => {
  const chat = await Conversation.create({ user: req.user.id, title: "New Chat" });
  res.status(201).json({ message: "Chat created successfully", chat });
});

// GET /api/chats
const getChats = asyncHandler(async (req, res) => {
  const chats = await Conversation.find({ user: req.user.id }).sort({ updatedAt: -1 });
  res.status(200).json({ chats });
});

// GET /api/chats/:id
const getChat = asyncHandler(async (req, res) => {
  // THE key security line: filter by _id AND user together. A bad
  // :id (not a valid ObjectId) now correctly surfaces as a 400 "Invalid
  // ID format" via errorMiddleware's CastError handling, instead of the
  // generic 500 this used to return.
  const chat = await Conversation.findOne({ _id: req.params.id, user: req.user.id });

  if (!chat) {
    // Deliberately 404, not 403 — doesn't confirm to an attacker that a
    // chat with this ID exists but belongs to someone else.
    throw new AppError("Chat not found", 404);
  }

  const messages = await Message.find({ conversation: chat._id }).sort({ createdAt: 1 });
  res.status(200).json({ chat, messages });
});

// POST /api/chats/:id/messages
const addMessage = asyncHandler(async (req, res) => {
  const result = chatSchema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }
  const { content, documentId } = result.data;

  const chat = await Conversation.findOne({ _id: req.params.id, user: req.user.id });
  if (!chat) {
    throw new AppError("Chat not found", 404);
  }

  const userMessage = await Message.create({
    conversation: chat._id,
    role: "user",
    content: content.trim(),
  });

  const history = await Message.find({ conversation: chat._id }).sort({ createdAt: 1 });

  let assistantMessage;
  try {
    const { text, sources } = await getAIResponse(history, documentId);
    assistantMessage = await Message.create({
      conversation: chat._id,
      role: "assistant",
      content: text,
      sources: sources || [],
    });
  } catch (aiErr) {
    console.error("AI service error:", aiErr.type || "UNKNOWN", aiErr.message);

    chat.updatedAt = new Date();
    await chat.save();

    return res.status(502).json({
      error: "The AI service is temporarily unavailable. Please try again.",
      userMessage, // still return this — the user's message WAS saved successfully
    });
  }

  chat.updatedAt = new Date();
  await chat.save();

  res.status(201).json({ userMessage, assistantMessage });
});

// DELETE /api/chats/:id
const deleteChat = asyncHandler(async (req, res) => {
  const chat = await Conversation.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!chat) {
    throw new AppError("Chat not found", 404);
  }

  await Message.deleteMany({ conversation: chat._id });
  res.status(200).json({ message: "Chat deleted successfully" });
});

module.exports = { createChat, getChats, getChat, addMessage, deleteChat };