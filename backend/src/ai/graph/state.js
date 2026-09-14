const { Annotation } = require("@langchain/langgraph");

const GraphState = Annotation.Root({
  message: Annotation(),
  historyMessages: Annotation(),
  next: Annotation(),
  response: Annotation(),
  documentId: Annotation(),
  sources: Annotation({
    default: () => [],
  }),
});

module.exports = { GraphState };