// textSplitter.js
// Day 20: breaks large text into overlapping chunks so retrieval can find
// precise, relevant sections instead of matching an entire document at once.

const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200
});

module.exports = textSplitter;