// retrieveDocuments.js
// Day 24: added documentId filtering — uses qdrantClient.query() (not
// .search(), which doesn't exist in this client — Day 19/22).
// Day 32: MIN_SCORE was a hardcoded module constant (0.2 in code, though
// Day 24's README note said 0.5 — reconciling on the code's actual
// tested value, since that's what was verified working). Now a
// scoreThreshold parameter, so it's tunable per call instead of fixed.
// Also added candidate/pass-count logging for development visibility.

const embeddings = require("../models/embeddingModel");
const qdrantClient = require("../vector/qdrantClient");

const COLLECTION_NAME = "document_chunks";

const retrieveDocuments = async (
  question,
  documentId,
  limit = 5,
  scoreThreshold = 0.2 // Day 24's tested value, not the plan's untested 0.70
) => {
  const queryVector = await embeddings.embedQuery(question);

  const results = await qdrantClient.query(COLLECTION_NAME, {
    query: queryVector,
    limit,
    filter: {
      must: [{ key: "documentId", match: { value: documentId } }]
    },
    with_payload: true
  });

  const formatted = results.points.map((result) => ({
    text: result.payload?.text || "",
    score: result.score,
    documentId: result.payload?.documentId,
    metadata: result.payload?.metadata
  }));

  const filteredResults = formatted.filter((result) => result.score >= scoreThreshold);

  console.log(`[retrieveDocuments] ${formatted.length} candidates -> ${filteredResults.length} passed threshold ${scoreThreshold}`);
  filteredResults.forEach((doc, i) => console.log(`  chunk ${i + 1} score:`, doc.score));

  return filteredResults;
};

module.exports = retrieveDocuments;