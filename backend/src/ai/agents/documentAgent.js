// documentAgent.js
//
// Same honesty principle as researchAgent — RAG/Qdrant doesn't exist
// yet, so this agent tells the user that rather than hallucinating
// document contents it never actually retrieved.

const { getChatModel } = require("../models/chatModel");
const { documentPrompt } = require("../prompts/documentPrompt");

async function runDocumentAgent(message, historyMessages = []) {
  const messages = await documentPrompt.formatMessages({
    history: historyMessages,
    question: message,
  });

  const model = getChatModel();
  const response = await model.invoke(messages);
  return response.content;
}

module.exports = { runDocumentAgent };