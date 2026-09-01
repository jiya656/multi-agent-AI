// toolNode.js
//
// STEP 15: reads the agent's tool call request, actually executes the
// real tool, and produces a ToolMessage with the result. LangGraph's
// prebuilt ToolNode does exactly what we hand-wrote back on Day 8/9 (the
// for-loop over tool_calls, executing each one, wrapping results in
// ToolMessage) — except now it's a maintained LangGraph primitive
// instead of code we own and could introduce bugs into.
//
// IMPORTANT: must be registered on the graph under the exact name
// "tools" — LangGraph's toolsCondition (used in graph.js) hardcodes
// returning the string "tools" when it detects a pending tool call, so
// the node name and that string must match exactly.

const { ToolNode } = require("@langchain/langgraph/prebuilt");
const { calculatorTool } = require("../../tools/calculatorTool");

const toolNode = new ToolNode([calculatorTool]);

module.exports = { toolNode };