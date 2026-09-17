const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { uploadDocument, getDocuments } = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", getDocuments);

module.exports = router;