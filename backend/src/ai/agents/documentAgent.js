const { getChatModel } = require("../models/chatModel");
const { documentPrompt } = require("../prompts/documentPrompt");
const retrieveDocuments = require("../rag/retrieveDocuments");
const formatContext = require("../rag/formatContext");
const formatSources = require("../rag/formatSources");

// "Summarize this PDF" doesn't resemble any chunk of the PDF, so a score
// threshold would reject every chunk. For these overview-style requests we
// take the closest chunks with no minimum score.
const OVERVIEW_PATTERN =
  /summar|overview|key points|main points|about this (document|pdf|file)|this (document|pdf|file) about/i;

async function runDocumentAgent(message, historyMessages = [], documentId) {
  const isOverview = OVERVIEW_PATTERN.test(message);
  const retrievedDocuments = isOverview
    ? await retrieveDocuments(message, documentId, 5, 0)
    : await retrieveDocuments(message, documentId, 5);

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