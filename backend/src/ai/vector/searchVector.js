// searchVector.js
// Day 19: runs a similarity search against the demo point.
// NOTE: newer versions of @qdrant/js-client-rest replaced `search()`
// with `query()` — same purpose, slightly different call shape.
// query() returns { points: [...] } instead of a bare array.

const qdrantClient = require("./qdrantClient");

const COLLECTION_NAME = "documents";

const searchVector = async () => {
  const results = await qdrantClient.query(COLLECTION_NAME, {
    query: [0.1, 0.2, 0.3, 0.4],
    limit: 3,
    with_payload: true
  });

  console.log(results.points);
};

searchVector();