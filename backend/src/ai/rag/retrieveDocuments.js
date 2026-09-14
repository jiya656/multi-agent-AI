// retrieveDocuments.js
// Day 24: added documentId filtering — retrieval now only searches
// chunks belonging to the selected document, not the entire collection.
// Still uses qdrantClient.query() (not .search(), which doesn't exist
// in this client — see Day 19/22 notes), with filter as a sibling key
// alongside query/limit.

const embeddings = require("../models/embeddingModel");
const qdrantClient = require("../vector/qdrantClient");

const COLLECTION_NAME = "document_chunks";
const MIN_SCORE = 0.2; // experiment with this — not a universal constant

const retrieveDocuments = async (question, documentId, limit = 5) => {
  const queryVector = await embeddings.embedQuery(question);

  const results = await qdrantClient.query(COLLECTION_NAME, {
    query: queryVector,
    limit,
    filter: {
      must: [
        {
          key: "documentId",
          match: {
            value: documentId
          }
        }
      ]
    },
    with_payload: true
  });

  const formatted = results.points.map((result) => ({
    text: result.payload?.text || "",
    score: result.score,
    documentId: result.payload?.documentId,
    metadata: result.payload?.metadata
  }));

  // Drop low-relevance results rather than pass noise to the LLM
  return formatted.filter((result) => result.score >= MIN_SCORE);
};

module.exports = retrieveDocuments;