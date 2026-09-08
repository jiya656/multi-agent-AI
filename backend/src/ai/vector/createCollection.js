// createCollection.js
// Day 19: creates the "documents" collection if it doesn't already exist.
// NOTE: size: 4 is a throwaway demo dimension for today only — the real
// RAG pipeline will use whatever dimension the chosen embedding model
// produces, not 4.

const qdrantClient = require("./qdrantClient");

const COLLECTION_NAME = "documents";

const createCollection = async () => {
  const exists = await qdrantClient.collectionExists(COLLECTION_NAME);

  if (!exists.exists) {
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 4,
        distance: "Cosine"
      }
    });

    console.log("Collection created");
  } else {
    console.log("Collection already exists");
  }
};

createCollection();