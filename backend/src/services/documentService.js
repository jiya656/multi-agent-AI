// documentService.js
// Day 26: status tracking. Day 36: ingestion moved off the request path
// entirely — this now only creates the record and enqueues the job;
// the worker (documentWorker.js) does the actual processing and status
// transition to completed/failed.

const Document = require("../models/Document");
const documentQueue = require("../jobs/queues/documentQueue");

const processDocument = async (file, userId) => {
  const document = await Document.create({
    userId,
    fileName: file.originalname,
    filePath: file.path,
    status: "processing" // schema default already, kept explicit for clarity
  });

  await documentQueue.add(
    "process-document",
    { filePath: file.path, documentId: document._id.toString() },
    { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
  );

  return document;
};

module.exports = { processDocument };