const { runDocumentAgent } = require("../../agents/documentAgent");

async function documentNode(state) {
  console.log("[documentNode] handling:", JSON.stringify(state.message));
  const response = await runDocumentAgent(state.message, state.historyMessages || []);
  return { response };
}

module.exports = { documentNode };