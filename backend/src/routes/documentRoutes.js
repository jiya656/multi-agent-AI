const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { uploadDocument } = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Same pattern as chatRoutes.js — every route here requires a valid JWT.
router.use(protect);

router.post("/upload", upload.single("file"), uploadDocument);

module.exports = router;