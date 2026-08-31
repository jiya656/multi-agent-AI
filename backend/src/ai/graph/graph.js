// graph.js
//
// Day 10: a straight-line graph (processMessage -> callModel).
// Day 11: our first BRANCHING graph. Same question can now take one of
// two different paths depending on what it's about — that's the whole
// point of conditional routing.

const { StateGraph, START, END } = require("@langchain/langgraph");
const { GraphState } = require("./state");
const { router } = require("./router");
const { chatPrompt } = require("../prompts/chatPrompt");
const { runAgent } = require("../agents/agent");

// STEP 11: classifyMessage — figures out what KIND of request this is.
// Today: simple keyword-based rules (Step 9's "Option 1"), deliberately
// basic so the GRAPH MECHANISM is the thing being learned, not
// classification sophistication. Later this becomes an LLM/supervisor
// decision instead of a hardcoded keyword list.
const CODING_KEYWORDS = [
  "code", "coding", "javascript", "react", "java", "python",
  "function", "programming", "api", "algorithm", "bug", "syntax", "variable",
];

function classifyMessage(state) {
  const text = state.message.toLowerCase();
  const category = CODING_KEYWORDS.some((k) => text.includes(k)) ? "coding" : "general";
  console.log("[graph] classifyMessage —", JSON.stringify(state.message), "-> category:", category);
  return { category };
}

// Shared helper: both nodes below answer the SAME way underneath (via
// our existing agent, preserving tool-calling + memory like Day 10) —
// they're deliberately identical in behavior today. What's different is
// WHICH one runs, decided by the router. In later days, codingNode and
// generalNode will genuinely diverge (different prompts, different
// tools) — today's goal is proving the ROUTING mechanism works, first.
async function answerViaAgent(state) {
  const messages = await chatPrompt.formatMessages({
    history: state.historyMessages || [],
    question: state.message,
  });
  const result = await runAgent(messages);
  return result.content;
}

async function codingNode(state) {
  console.log("[graph] codingNode handling:", JSON.stringify(state.message));
  const response = await answerViaAgent(state);
  return { response };
}

async function generalNode(state) {
  console.log("[graph] generalNode handling:", JSON.stringify(state.message));
  const response = await answerViaAgent(state);
  return { response };
}

// STEP 17-19: wire it together.
// Normal edges (fixed): START -> classifyMessage, codingNode -> END, generalNode -> END
// Conditional edge: classifyMessage -> (router decides) -> codingNode OR generalNode
const graph = new StateGraph(GraphState)
  .addNode("classifyMessage", classifyMessage)
  .addNode("codingNode", codingNode)
  .addNode("generalNode", generalNode)
  .addEdge(START, "classifyMessage")
  .addConditionalEdges("classifyMessage", router, ["codingNode", "generalNode"])
  .addEdge("codingNode", END)
  .addEdge("generalNode", END)
  .compile();

async function runGraph(message, historyMessages = []) {
  const finalState = await graph.invoke({ message, historyMessages, category: "", response: "" });
  return finalState.response;
}

module.exports = { runGraph, GraphState };