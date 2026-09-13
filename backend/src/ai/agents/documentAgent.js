// documentAgent.js
// Day 24: now accepts documentId and passes it to the retriever, so
// retrieval only searches the selected document's chunks. Also handles
// the case where nothing relevant is found, instead of guessing.

const { getChatModel } = require("../models/chatModel");
const { documentPrompt } = require("../prompts/documentPrompt");
const retrieveDocuments = require("../rag/retrieveDocuments");

async function runDocumentAgent(message, historyMessages = [], documentId) {
  // 1. Retrieve relevant chunks, restricted to this document
  const retrievedDocuments = await retrieveDocuments(message, documentId, 3);

  // 2. If nothing relevant was found, don't guess — say so honestly
  if (retrievedDocuments.length === 0) {
    return "I couldn't find relevant information about this in the selected document.";
  }

  // 3. Build context string from retrieved chunks
  const context = retrievedDocuments
    .map((doc, i) => `Source ${i + 1}:\n${doc.text}`)
    .join("\n\n");

  // 4. Format the prompt with history, retrieved context, and the question
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