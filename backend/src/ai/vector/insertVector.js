// insertVector.js
// Day 19: manually inserts one demo point (fake vector, real-shaped payload)
// to learn Qdrant's point structure before real embeddings exist.

const qdrantClient = require("./qdrantClient");

const COLLECTION_NAME = "documents";

const insertVector = async () => {
  await qdrantClient.upsert(COLLECTION_NAME, {
    wait: true,

    points: [
      {
        id: 1,
        vector: [0.1, 0.2, 0.3, 0.4],
        payload: {
          text: "MongoDB is used as the primary database.",
          page: 3,
          documentId: "demo-document"
        }
      }
    ]
  });

  console.log("Vector inserted");
};

insertVector();