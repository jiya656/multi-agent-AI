// testRag.js
// Day 20: proves the full RAG mechanics work end-to-end using REAL
// embeddings for the first time. This does not touch an actual PDF yet
// (that's Day 21+) — these sample chunks simulate what real document
// ingestion would produce.

const qdrantClient = require("../vector/qdrantClient");
const embeddings = require("../models/embeddingModel");

const COLLECTION_NAME = "document_chunks";

const sampleChunks = [
  "Machine learning is a field of artificial intelligence that enables systems to learn from data.",
  "Supervised learning is a type of machine learning where models learn from labeled training data.",
  "Unsupervised learning finds patterns in data without labeled examples.",
  "Reinforcement learning uses rewards and penalties to train an agent to make decisions."
];

const testRag = async () => {
  // Step 1: embed all sample chunks
  const vectors = await embeddings.embedDocuments(sampleChunks);

  // Step 2: store each chunk with its real vector
  await qdrantClient.upsert(COLLECTION_NAME, {
    wait: true,
    points: sampleChunks.map((text, i) => ({
      id: i + 1,
      vector: vectors[i],
      payload: {
        text,
        documentId: "demo-document",
        page: i + 1
      }
    }))
  });

  console.log("Chunks embedded and stored.");

  // Step 3: embed a real user question
  const question = "What is supervised learning?";
  const questionVector = await embeddings.embedQuery(question);

  // Step 4: similarity search against the real chunks
  const results = await qdrantClient.query(COLLECTION_NAME, {
    query: questionVector,
    limit: 2,
    with_payload: true
  });

  console.log("Question:", question);
  console.log("Most relevant chunk(s):", results.points);
};

testRag();