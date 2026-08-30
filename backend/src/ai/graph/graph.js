// graph.js
//
// Our first LangGraph workflow. Deliberately small — Step 10's whole
// point is learning State/Node/Edge with a workflow simple enough to
// actually understand, not building the final multi-agent system today.
//
// ONE DELIBERATE DEVIATION FROM THE PLAN'S LITERAL EXAMPLE, worth being
// honest about: the plan's callModel example makes a bare LLM call. Our
// app already has tool-calling (Day 8) and conversation memory (Day 6)
// working through agent.js (Day 9). Wiring this graph in a way that lost
// either would be a real regression, not just "keeping it simple" — so
// callModel calls our EXISTING runAgent() internally. The graph still
// teaches the real State/Node/Edge concepts; it just doesn't throw away
// working functionality to do it.

const { StateGraph, Annotation, START, END } = require("@langchain/langgraph");
const { chatPrompt } = require("../prompts/chatPrompt");
const { runAgent } = require("../agents/agent");

// STEP 13: our state — the "backpack" carried through the graph.
// Annotation() with no arguments = a plain channel that gets replaced
// on every update (the simplest kind — no custom merging logic needed
// for these fields).
const GraphState = Annotation.Root({
  message: Annotation(), // the user's current question (string)
  historyMessages: Annotation(), // prior turns, as LangChain message objects (array)
  response: Annotation(), // filled in once callModel finishes
});

// STEP 14: processMessage — reads the raw input and does light
// normalization. On purpose, this node does NOT talk to the AI at all —
// that's a different node's job. This is what "a node is a unit of
// work" means concretely: one clear, narrow responsibility per node.
function processMessage(state) {
  console.log("[graph] processMessage — received:", state.message);
  return { message: state.message.trim() };
}

// STEP 15: callModel — sends the message (WITH conversation history) to
// our existing agent, so this node gets tool-calling and memory "for
// free" from work we already built, rather than reimplementing it here.
async function callModel(state) {
  console.log("[graph] callModel — sending to agent:", state.message);
  const messages = await chatPrompt.formatMessages({
    history: state.historyMessages || [],
    question: state.message,
  });
  const result = await runAgent(messages);
  console.log("[graph] callModel — agent responded");
  return { response: result.content };
}

// STEP 16: wire START -> processMessage -> callModel -> END.
// This IS the whole graph structure: two nodes, three edges.
const graph = new StateGraph(GraphState)
  .addNode("processMessage", processMessage)
  .addNode("callModel", callModel)
  .addEdge(START, "processMessage")
  .addEdge("processMessage", "callModel")
  .addEdge("callModel", END)
  .compile();

// Runs the graph for one turn and returns just the final response text —
// this is the function aiService.js actually calls; it doesn't need to
// know anything about state, nodes, or edges under the hood.
async function runGraph(message, historyMessages = []) {
  const finalState = await graph.invoke({ message, historyMessages, response: "" });
  return finalState.response;
}

module.exports = { runGraph, GraphState };