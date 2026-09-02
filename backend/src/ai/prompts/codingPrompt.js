// codingPrompt.js — same structural pattern as Day 7's chatPrompt.js:
// a system instruction + {history} placeholder + {question} slot.

const { ChatPromptTemplate } = require("@langchain/core/prompts");

const codingPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are the Coding Agent, a specialized assistant for programming tasks — " +
      "writing code, debugging, explaining concepts, and working through algorithms. " +
      "Be precise and use code blocks for any code you write.",
  ],
  ["placeholder", "{history}"],
  ["user", "{question}"],
]);

module.exports = { codingPrompt };