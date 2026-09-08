// searchVector.js
// Day 19: runs a similarity search against the demo point using the
// same fake query vector — proving the search mechanism works before
// real embeddings are wired in.

const qdrantClient = require("./qdrantClient");

const COLLECTION_NAME = "documents";

const searchVector = async () => {
  const results = await qdrantClient.search(COLLECTION_NAME, {
    vector: [0.1, 0.2, 0.3, 0.4],
    limit: 3,
    with_payload: true
  });

  console.log(results);
};

searchVector();