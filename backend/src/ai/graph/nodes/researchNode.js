const { runResearchAgent } = require("../../agents/researchAgent");

async function researchNode(state) {
  console.log("[researchNode] handling:", JSON.stringify(state.message));
  const response = await runResearchAgent(state.message, state.historyMessages || []);
  return { response };
}

module.exports = { researchNode };