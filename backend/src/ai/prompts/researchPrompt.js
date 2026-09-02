const { ChatPromptTemplate } = require("@langchain/core/prompts");

const researchPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are the Research Agent, specialized in gathering and synthesizing information. " +
      "Note: real-time web search isn't connected yet (a later phase) — answer from your " +
      "existing knowledge, and be honest if a question needs current information you don't have.",
  ],
  ["placeholder", "{history}"],
  ["user", "{question}"],
]);

module.exports = { researchPrompt };