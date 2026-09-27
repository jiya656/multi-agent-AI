// documentWorker.js
// Day 36: runs Day 21's ingestDocument() outside the request/response
// cycle. Status transitions mirror documentService.js's existing
// try/catch exactly, so behavior on failure is unchanged — just moved.

const { Worker } = require("bullmq");
const Document = require("../../models/Document");
const ingestDocument = require("../../ai/rag/ingestDocument");

const documentWorker = new Worker(
  "document-processing",
  async (job) => {
    const { filePath, documentId } = job.data;
    console.log("[documentWorker] processing:", documentId);

    try {
      await ingestDocument(filePath, documentId);

      await Document.findByIdAndUpdate(documentId, {
        status: "completed"
      });

      console.log("[documentWorker] completed:", documentId);
    } catch (error) {
      await Document.findByIdAndUpdate(documentId, {
        status: "failed",
        errorMessage: error.message
      });

      throw error; // let BullMQ see the failure too, for retries/logging
    }
  },
  { connection: { url: process.env.REDIS_URL } }
);

documentWorker.on("completed", (job) => console.log(`[documentWorker] job ${job.id} completed`));
documentWorker.on("failed", (job, error) => console.error(`[documentWorker] job ${job?.id} failed:`, error.message));

module.exports = documentWorker;