const { runCodingAgent } = require("../../agents/codingAgent");

async function codingNode(state) {
  console.log("[codingNode] handling:", JSON.stringify(state.message));
  const response = await runCodingAgent(state.message, state.historyMessages || []);
  return { response };
}

module.exports = { codingNode };