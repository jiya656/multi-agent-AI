// documentQueue.js
// Day 36: PDF ingestion (Day 21's pipeline) currently runs synchronously
// inside the upload request — documentService.js awaits ingestDocument()
// before responding, so a large PDF makes the user's upload request
// hang until embeddings + Qdrant storage fully finish. This queue moves
// that work to a background worker instead.

const { Queue } = require("bullmq");

const documentQueue = new Queue("document-processing", {
  connection: { url: process.env.REDIS_URL }
});

module.exports = documentQueue;