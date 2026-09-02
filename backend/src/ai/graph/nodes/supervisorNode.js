// supervisorNode.js
//
// Wraps supervisorAgent's decision for the graph. Special case: if the
// supervisor decides "end" (no specialist needed — a greeting, a
// thank-you), there's no specialist node left to generate a response, so
// the supervisor answers directly here using the general chat prompt
// from Day 7, rather than the graph reaching END with an empty response.

const { decideRoute } = require("../../agents/supervisorAgent");
const { getChatModel } = require("../../models/chatModel");
const { chatPrompt } = require("../../prompts/chatPrompt");

async function supervisorNode(state) {
  const next = await decideRoute(state.message, state.historyMessages || []);
  console.log("[supervisorNode]", JSON.stringify(state.message), "-> next:", next);

  if (next === "end") {
    const messages = await chatPrompt.formatMessages({
      history: state.historyMessages || [],
      question: state.message,
    });
    const model = getChatModel();
    const response = await model.invoke(messages);
    return { next, response: response.content };
  }

  return { next };
}

module.exports = { supervisorNode };