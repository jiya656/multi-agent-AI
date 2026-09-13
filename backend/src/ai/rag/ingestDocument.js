// ingestDocument.js
// Day 21: the real ingestion pipeline — coordinates PDF loading, chunking,
// embedding, and storage into Qdrant. Uses our existing local embedding
// model (embedDocuments), same interface as testRag.js used on Day 20.
//
// Day 24 fix: point IDs now use crypto.randomUUID() instead of a bare
// index counter. The old `id: index + 1` caused a real bug — ingesting
// any second document with 3+ chunks would silently overwrite the first
// document's points, since both started counting from 1.

const crypto = require("crypto");
const loadPDF = require("./pdfLoader");
const textSplitter = require("./textSplitter");
const embeddings = require("../models/embeddingModel");
const qdrantClient = require("../vector/qdrantClient");

const COLLECTION_NAME = "document_chunks";

const ingestDocument = async (filePath, documentId) => {
  // 1. Load PDF
  const documents = await loadPDF(filePath);
  console.log(`Loaded ${documents.length} pages`);

  // 2. Split into chunks
  const chunks = await textSplitter.splitDocuments(documents);
  console.log(`Created ${chunks.length} chunks`);

  // 3. Create embeddings
  const texts = chunks.map((chunk) => chunk.pageContent);
  const vectors = await embeddings.embedDocuments(texts);

  // 4. Prepare Qdrant points
  const points = chunks.map((chunk, index) => ({
    id: crypto.randomUUID(),
    vector: vectors[index],
    payload: {
      text: chunk.pageContent,
      documentId,
      metadata: chunk.metadata
    }
  }));

  // 5. Store in Qdrant
  await qdrantClient.upsert(COLLECTION_NAME, {
    wait: true,
    points
  });

  console.log("Document successfully stored in Qdrant");
};

module.exports = ingestDocument;