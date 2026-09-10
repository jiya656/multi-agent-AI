// ingestDocument.js
// Day 21: the real ingestion pipeline — coordinates PDF loading, chunking,
// embedding, and storage into Qdrant. Uses our existing local embedding
// model (embedDocuments), same interface as testRag.js used on Day 20.

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
    id: index + 1,
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