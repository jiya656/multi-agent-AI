// redis.js
// Day 34: single shared Redis connection, following the same
// "one client, imported everywhere" pattern as qdrantClient.js and
// chatModel.js. Used for fast, temporary caching (RAG retrieval
// results) — NOT for permanent data. MongoDB stays the source of
// truth for users/conversations/messages/documents.

const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected");
  }
};

module.exports = { redisClient, connectRedis };