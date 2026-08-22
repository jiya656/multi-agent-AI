// chatController.js
//
// Every function here assumes `protect` middleware has already run
// (see chatRoutes.js), so req.user.id is always available and trustworthy
// — it came from a verified JWT, not from anything the client claimed.

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// POST /api/chats
async function createChat(req, res) {
  try {
    const chat = await Conversation.create({
      user: req.user.id,
      title: "New Chat",
    });
    res.status(201).json({ message: "Chat created successfully", chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong creating the chat" });
  }
}

// GET /api/chats
async function getChats(req, res) {
  try {
    // Only ever return conversations belonging to the logged-in user —
    // this is the query-level half of the ownership check.
    const chats = await Conversation.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json({ chats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong fetching chats" });
  }
}

// GET /api/chats/:id
async function getChat(req, res) {
  try {
    // THE key security line: we filter by _id AND user together, not
    // just _id. If another user's ID is passed in the URL, this returns
    // null (not someone else's chat) because the `user` field won't match.
    const chat = await Conversation.findOne({ _id: req.params.id, user: req.user.id });

    if (!chat) {
      // Deliberately 404, not 403. Returning 403 ("Forbidden") would
      // confirm to an attacker that a chat with this ID exists but isn't
      // theirs. 404 ("Not Found") gives away nothing either way.
      return res.status(404).json({ error: "Chat not found" });
    }

    const messages = await Message.find({ conversation: chat._id }).sort({ createdAt: 1 });

    res.status(200).json({ chat, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong fetching the chat" });
  }
}

// POST /api/chats/:id/messages
async function addMessage(req, res) {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "content is required" });
    }

    // Same ownership check as getChat — verify the conversation exists
    // AND belongs to this user BEFORE writing anything to it.
    const chat = await Conversation.findOne({ _id: req.params.id, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const message = await Message.create({
      conversation: chat._id,
      role: "user",
      content: content.trim(),
    });

    // Touch the conversation's updatedAt so it moves to the top of the
    // sidebar (getChats sorts by updatedAt descending). Just creating a
    // Message doesn't automatically update its parent Conversation —
    // they're separate documents, so we do this explicitly.
    chat.updatedAt = new Date();
    await chat.save();

    res.status(201).json({ message: "Message saved", data: message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong saving the message" });
  }
}

// DELETE /api/chats/:id
async function deleteChat(req, res) {
  try {
    const chat = await Conversation.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Cascade delete: a Conversation being gone but its Messages still
    // sitting in the database (orphaned, pointing at a conversation ID
    // that no longer exists) would silently waste storage forever.
    await Message.deleteMany({ conversation: chat._id });

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong deleting the chat" });
  }
}

module.exports = { createChat, getChats, getChat, addMessage, deleteChat };