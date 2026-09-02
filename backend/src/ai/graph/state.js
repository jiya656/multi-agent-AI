// state.js
//
// Day 13's backpack. `next` is the supervisor's routing decision —
// written by supervisorNode, read by router.js.

const { Annotation } = require("@langchain/langgraph");

const GraphState = Annotation.Root({
  message: Annotation(),
  historyMessages: Annotation(),
  next: Annotation(), // "coding" | "research" | "document" | "end"
  response: Annotation(),
});

module.exports = { GraphState };