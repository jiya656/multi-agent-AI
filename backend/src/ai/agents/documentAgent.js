// documentAgent.js
// Day 23: now retrieves relevant chunks before asking the LLM, instead of
// answering blind. This is the actual RAG connection — retrieval +
// augmentation happen here, generation still happens via chatModel.

const { getChatModel } = require("../models/chatModel");
const { documentPrompt } = require("../prompts/documentPrompt");
const retrieveDocuments = require("../rag/retrieveDocuments");

async function runDocumentAgent(message, historyMessages = []) {
  // 1. Retrieve relevant chunks for this question
  const retrievedDocuments = await retrieveDocuments(message, 3);

  // 2. Build context string from retrieved chunks
  const context = retrievedDocuments.length > 0
    ? retrievedDocuments
        .map((doc, i) => `Source ${i + 1}:\n${doc.text}`)
        .join("\n\n")
    : "No relevant document context was found.";

  // 3. Format the prompt with history, retrieved context, and the question
  const messages = await documentPrompt.formatMessages({
    history: historyMessages,
    context,
    question: message,
  });

  const model = getChatModel();
  const response = await model.invoke(messages);
  return response.content;
}

module.exports = { runDocumentAgent };