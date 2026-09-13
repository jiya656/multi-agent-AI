// state.js
//
// Day 13's backpack. `next` is the supervisor's routing decision —
// written by supervisorNode, read by router.js.
// Day 24: added documentId, so the Document Agent knows which uploaded
// document to restrict retrieval to.

const { Annotation } = require("@langchain/langgraph");

const GraphState = Annotation.Root({
  message: Annotation(),
  historyMessages: Annotation(),
  next: Annotation(), // "coding" | "research" | "document" | "end"
  response: Annotation(),
  documentId: Annotation(), // which uploaded document to restrict retrieval to
});

module.exports = { GraphState };