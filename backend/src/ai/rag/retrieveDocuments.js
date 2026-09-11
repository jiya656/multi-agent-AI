// retrieveDocuments.js
// Day 22: converts a user's question into an embedding, then searches
// Qdrant for the most semantically similar stored chunks.
//
// NOTE: uses qdrantClient.query() instead of the plan's .search() —
// same fix as Day 19's searchVector.js. This client's response is
// wrapped in { points: [...] } rather than a bare array, and the vector
// is passed under `query:` instead of `vector:`.

const embeddings = require("../models/embeddingModel");
const qdrantClient = require("../vector/qdrantClient");

const COLLECTION_NAME = "document_chunks";

const retrieveDocuments = async (question, limit = 3) => {
  // 1. Convert question into vector
  const queryVector = await embeddings.embedQuery(question);

  // 2. Search Qdrant
  const results = await qdrantClient.query(COLLECTION_NAME, {
    query: queryVector,
    limit,
    with_payload: true
  });

  // 3. Return clean, formatted results — not the raw Qdrant response shape
  return results.points.map((result) => ({
    text: result.payload?.text || "",
    score: result.score,
    documentId: result.payload?.documentId,
    metadata: result.payload?.metadata
  }));
};

module.exports = retrieveDocuments;