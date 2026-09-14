const { getChatModel } = require("../models/chatModel");
const { documentPrompt } = require("../prompts/documentPrompt");
const retrieveDocuments = require("../rag/retrieveDocuments");
const formatContext = require("../rag/formatContext");
const formatSources = require("../rag/formatSources");

async function runDocumentAgent(message, historyMessages = [], documentId) {
  const retrievedDocuments = await retrieveDocuments(message, documentId, 5);

  if (retrievedDocuments.length === 0) {
    return {
      answer: "I couldn't find relevant information about this in the selected document.",
      sources: []
    };
  }

  const context = formatContext(retrievedDocuments);

  const messages = await documentPrompt.formatMessages({
    history: historyMessages,
    context,
    question: message,
  });

  const model = getChatModel();
  const response = await model.invoke(messages);

  return {
    answer: response.content,
    sources: formatSources(retrievedDocuments)
  };
}

module.exports = { runDocumentAgent };