const { debug } = require("../../../utils/logger");
const { decideRoute } = require("../../agents/supervisorAgent");
const { getChatModel } = require("../../models/chatModel");
const { chatPrompt } = require("../../prompts/chatPrompt");

async function supervisorNode(state) {
  if (state.documentId) {
    debug("[supervisorNode] document selected:", state.documentId, "-> next: document");
    return { next: "document" };
  }

  const next = await decideRoute(state.message, state.historyMessages || []);
  debug("[supervisorNode]", JSON.stringify(state.message), "-> next:", next);

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