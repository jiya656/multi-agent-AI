// chatRoutes.js

const express = require("express");
const { createChat, getChats, getChat, addMessage, deleteChat } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Every single chat route requires a valid JWT — applying `protect` to
// the whole router at once (router.use) instead of repeating it on each
// individual route below.
router.use(protect);

router.post("/", createChat);
router.get("/", getChats);
router.get("/:id", getChat);
router.post("/:id/messages", addMessage);
router.delete("/:id", deleteChat);

module.exports = router;