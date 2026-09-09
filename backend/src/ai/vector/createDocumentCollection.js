// createDocumentCollection.js
// Day 20: creates the REAL collection for document chunks, sized to match
// our actual embedding model (Xenova/all-MiniLM-L6-v2 → 384 dimensions).
// This is separate from Day 19's demo "documents" collection (size 4).

const qdrantClient = require("./qdrantClient");

const COLLECTION_NAME = "document_chunks";
const VECTOR_SIZE = 384; // Xenova/all-MiniLM-L6-v2 output dimension

const createDocumentCollection = async () => {
  const exists = await qdrantClient.collectionExists(COLLECTION_NAME);

  if (!exists.exists) {
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine"
      }
    });
    console.log("document_chunks collection created");
  } else {
    console.log("document_chunks collection already exists");
  }
};

createDocumentCollection();