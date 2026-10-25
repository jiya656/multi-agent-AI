const { debug } = require("../../../utils/logger");
const { runCodingAgent } = require("../../agents/codingAgent");

async function codingNode(state) {
  debug("[codingNode] handling:", JSON.stringify(state.message));
  const response = await runCodingAgent(state.message, state.historyMessages || []);
  return { response };
}

module.exports = { codingNode };