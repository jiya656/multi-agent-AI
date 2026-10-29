// documentWorker.js
// Runs ingestDocument() outside the request/response cycle and tells the
// document's owner (via Redis pub/sub -> Socket.IO) when its status changes.

const { Worker } = require("bullmq");
const Document = require("../../models/Document");
const ingestDocument = require("../../ai/rag/ingestDocument");
const { publisher } = require("../../config/redisPubSub");

// Best-effort: if publishing fails, the document itself was still
// ingested/updated correctly, so a failed publish is never a failed ingestion.
const publishStatus = async (documentId, status, userId) => {
  try {
    await publisher.publish(
      "document-status",
      JSON.stringify({ documentId, status, userId: userId ? String(userId) : null })
    );
  } catch (err) {
    console.error("[documentWorker] failed to publish status:", err.message);
  }
};

const documentWorker = new Worker(
  "document-processing",
  async (job) => {
    const { filePath, documentId } = job.data;
    console.log("[documentWorker] processing:", documentId);

    try {
      await ingestDocument(filePath, documentId);

      // findByIdAndUpdate returns the document, which tells us who owns it
      const doc = await Document.findByIdAndUpdate(documentId, { status: "completed" });
      await publishStatus(documentId, "completed", doc?.userId);

      console.log("[documentWorker] completed:", documentId);
    } catch (error) {
      const doc = await Document.findByIdAndUpdate(documentId, {
        status: "failed",
        errorMessage: error.message
      });
      await publishStatus(documentId, "failed", doc?.userId);

      throw error;
    }
  },
  { connection: { url: process.env.REDIS_URL } }
);

documentWorker.on("completed", (job) => console.log(`[documentWorker] job ${job.id} completed`));
documentWorker.on("failed", (job, error) => console.error(`[documentWorker] job ${job?.id} failed:`, error.message));

module.exports = documentWorker;