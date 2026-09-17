const documentService = require("../services/documentService");
const Document = require("../models/Document");

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

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

const getDocuments = async (req, res) => {
  try {
    // route is protected (router.use(protect)), so req.user.id always exists
    const documents = await Document.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({ documents });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
};

module.exports = { uploadDocument, getDocuments };