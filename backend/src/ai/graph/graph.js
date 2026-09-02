// graph.js
//
// Day 12: the agent itself was a graph (agent <-> tools loop).
// Day 13: the graph gets a SUPERVISOR — the same conditional-routing
// mechanism from Day 11, now deciding between three real specialists
// instead of a toy coding/general split.
//
// Simplified per the plan's own recommendation: each specialist routes
// straight to END today, rather than looping back through the
// supervisor. The return-to-supervisor loop (for multi-step requests
// like "read my PDF, then research X") is a deliberate next step, not
// built yet — this keeps today's graph testable in isolation first.

const { StateGraph, START, END } = require("@langchain/langgraph");
const { GraphState } = require("./state");
const { router } = require("./router");
const { supervisorNode } = require("./nodes/supervisorNode");
const { codingNode } = require("./nodes/codingNode");
const { researchNode } = require("./nodes/researchNode");
const { documentNode } = require("./nodes/documentNode");

// The pathMap (object form) translates the supervisor's plain category
// string into the actual node name to run — this is what lets
// supervisorAgent.js's zod-constrained "coding"/"research"/"document"/
// "end" values map directly onto graph destinations.
const graph = new StateGraph(GraphState)
  .addNode("supervisorNode", supervisorNode)
  .addNode("codingNode", codingNode)
  .addNode("researchNode", researchNode)
  .addNode("documentNode", documentNode)
  .addEdge(START, "supervisorNode")
  .addConditionalEdges("supervisorNode", router, {
    coding: "codingNode",
    research: "researchNode",
    document: "documentNode",
    end: END,
  })
  .addEdge("codingNode", END)
  .addEdge("researchNode", END)
  .addEdge("documentNode", END)
  .compile();

async function runGraph(message, historyMessages = []) {
  const finalState = await graph.invoke({ message, historyMessages, next: "", response: "" });
  return finalState.response;
}

module.exports = { runGraph };