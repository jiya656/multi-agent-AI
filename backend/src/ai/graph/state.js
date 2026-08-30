// state.js
//
// The "backpack" our Day 11 graph carries. New field since Day 10:
// category — set by classifyMessage, read by router, to decide which
// node handles the request.

const { Annotation } = require("@langchain/langgraph");

const GraphState = Annotation.Root({
  message: Annotation(), // the user's current question (string)
  historyMessages: Annotation(), // prior turns, as LangChain message objects (array)
  category: Annotation(), // "coding" | "general" — set by classifyMessage
  response: Annotation(), // filled in once codingNode/generalNode finishes
});

module.exports = { GraphState };