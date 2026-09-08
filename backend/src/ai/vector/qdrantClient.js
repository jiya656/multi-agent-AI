// qdrantClient.js
// Day 19: single shared Qdrant connection, following the same
// "one client, imported everywhere" pattern as chatModel.js.
//
// NOTE: this file calls dotenv.config() itself, unlike other ai/ files,
// because these vector scripts are run standalone (node src/ai/vector/...)
// rather than through server.js, which is where dotenv normally loads.

require("dotenv").config();
const { QdrantClient } = require("@qdrant/js-client-rest");

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL
});

module.exports = qdrantClient;