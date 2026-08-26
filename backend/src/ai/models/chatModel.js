// chatModel.js
//
// This file's ONLY job: configure and return a LangChain chat model
// instance. Nothing else in the codebase should know or care that we're
// using Groq specifically, or which model name we've configured — they
// just call getChatModel() and get back something that speaks LangChain's
// standard chat model interface.
//
// Why this matters: if we later want a "cheap model" for simple tasks and
// a "smart model" for complex reasoning, those become sibling files here
// — cheapModel.js, researchModel.js — without touching anything that
// currently depends on chatModel.js.

const { ChatGroq } = require("@langchain/groq");

function getChatModel() {
  return new ChatGroq({
    apiKey: process.env.LLM_API_KEY,
    model: process.env.LLM_MODEL || "openai/gpt-oss-120b",
    temperature: 0.7,
  });
}

module.exports = { getChatModel };