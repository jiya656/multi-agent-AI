// formatSources.js
// Day 25: extracts a clean, user-facing citation shape from retrieved chunks.

const path = require("path");

const formatSources = (documents) => {
  return documents.map((doc) => ({
    documentId: doc.documentId,
    fileName: doc.metadata?.source
      ? path.basename(doc.metadata.source)
      : "Unknown document",
    pageNumber: doc.metadata?.loc?.pageNumber || null,
    score: doc.score
  }));
};

module.exports = formatSources;