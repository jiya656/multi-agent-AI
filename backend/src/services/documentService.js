// documentService.js
// Day 26: coordinates document upload — MongoDB record creation, then
// the RAG ingestion pipeline, then status update. Keeps the controller
// thin, same pattern as aiService.js sitting between chatController.js
// and the graph.

const Document = require("../models/Document");
const ingestDocument = require("../ai/rag/ingestDocument");

const processDocument = async (file, userId) => {
  const document = await Document.create({
    userId,
    fileName: file.originalname,
    filePath: file.path,
    status: "processing",
  });

  try {
    // Every chunk from this file gets this same documentId — this is
    // what makes Day 24's Qdrant filter actually meaningful for real
    // uploads, not just test data.
    await ingestDocument(file.path, document._id.toString());

    document.status = "completed";
    await document.save();

    return document;
  } catch (error) {
    document.status = "failed";
    document.errorMessage = error.message;
    await document.save();

    throw error;
  }
};

module.exports = { processDocument };