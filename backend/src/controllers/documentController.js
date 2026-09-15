const documentService = require("../services/documentService");

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    // req.user.id comes from the verified JWT (protect middleware) —
    // never trust a userId sent in the request body, per Day 24's notes.
    const userId = req.user.id;

    const document = await documentService.processDocument(req.file, userId);

    res.status(201).json({
      message: "Document uploaded and processed successfully",
      document: {
        id: document._id,
        fileName: document.fileName,
        status: document.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Document processing failed",
      error: error.message,
    });
  }
};

module.exports = { uploadDocument };