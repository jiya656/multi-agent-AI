// chatPrompt.js
//
// A reusable, structured prompt instead of hand-building message arrays
// wherever we need to talk to the LLM. Two variables:
//   {history}  — everything said earlier in this conversation
//   {question} — the newest thing the user just asked
//
// Keeping this separate means a future ResearchAgent or DocumentAgent can
// have its own prompt file with its own instructions, instead of every
// agent sharing (and fighting over) one giant prompt string.

const { ChatPromptTemplate } = require("@langchain/core/prompts");

const chatPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful AI assistant inside a multi-agent AI workspace. Be clear and concise.",
  ],
  // "placeholder" lets us inject an ARRAY of prior messages (already-typed
  // HumanMessage/AIMessage objects) right here, in order — this is how
  // conversation history gets woven into the prompt structurally, instead
  // of us manually concatenating strings.
  ["placeholder", "{history}"],
  ["user", "{question}"],
]);

module.exports = { chatPrompt };