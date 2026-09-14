const { runDocumentAgent } = require("../../agents/documentAgent");

async function documentNode(state) {
  console.log("[documentNode] handling:", JSON.stringify(state.message));
  const result = await runDocumentAgent(state.message, state.historyMessages || [], state.documentId);
  return { response: result.answer, sources: result.sources };
}

module.exports = { documentNode };