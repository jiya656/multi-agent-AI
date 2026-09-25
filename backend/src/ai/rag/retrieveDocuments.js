// retrieveDocuments.js
// Day 24: documentId filtering. Day 32: MIN_SCORE became a tunable
// scoreThreshold parameter (default 0.2). Still uses qdrantClient.query()
// (not .search() — Day 19/22).
// Day 34: cache-aside pattern with Redis. Cache key includes documentId,
// a hash of the question, and both limit + scoreThreshold — because
// different threshold/limit values legitimately produce different
// results for the same question, so they must not share a cache entry.

const crypto = require("crypto");
const embeddings = require("../models/embeddingModel");
const qdrantClient = require("../vector/qdrantClient");
const { redisClient } = require("../../config/redis");

const COLLECTION_NAME = "document_chunks";

const retrieveDocuments = async (question, documentId, limit = 5, scoreThreshold = 0.2) => {
  const questionHash = crypto.createHash("sha256").update(question.trim().toLowerCase()).digest("hex");
  const cacheKey = `rag:${documentId}:${questionHash}:${limit}:${scoreThreshold}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log("[retrieveDocuments] Redis cache hit:", cacheKey);
    return JSON.parse(cached);
  }
  console.log("[retrieveDocuments] Redis cache miss:", cacheKey);

  const queryVector = await embeddings.embedQuery(question);

  const results = await qdrantClient.query(COLLECTION_NAME, {
    query: queryVector,
    limit,
    filter: { must: [{ key: "documentId", match: { value: documentId } }] },
    with_payload: true
  });

  const formatted = results.points.map((result) => ({
    text: result.payload?.text || "",
    score: result.score,
    documentId: result.payload?.documentId,
    metadata: result.payload?.metadata
  }));

  const filteredResults = formatted.filter((result) => result.score >= scoreThreshold);

  await redisClient.set(cacheKey, JSON.stringify(filteredResults), { EX: 300 });

  return filteredResults;
};

module.exports = retrieveDocuments;