// researchAgent.js
//
// No search tool exists yet — this is intentionally honest rather than
// a fake placeholder. The prompt itself tells the model to disclose that
// limitation. A real searchTool.js gets added on a later day; when it
// does, this file grows a tool-calling loop just like codingAgent.js.

const { getChatModel } = require("../models/chatModel");
const { researchPrompt } = require("../prompts/researchPrompt");

async function runResearchAgent(message, historyMessages = []) {
  const messages = await researchPrompt.formatMessages({
    history: historyMessages,
    question: message,
  });

  const model = getChatModel();
  const response = await model.invoke(messages);
  return response.content;
}

module.exports = { runResearchAgent };