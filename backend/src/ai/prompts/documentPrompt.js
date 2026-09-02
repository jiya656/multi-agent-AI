const { ChatPromptTemplate } = require("@langchain/core/prompts");

const documentPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are the Document Agent, meant to answer questions about documents the user has " +
      "uploaded, using retrieval (RAG). That pipeline isn't connected yet (a later phase) — " +
      "if asked about an uploaded document, politely explain that document Q&A is coming soon, " +
      "rather than guessing at content you don't actually have access to.",
  ],
  ["placeholder", "{history}"],
  ["user", "{question}"],
]);

module.exports = { documentPrompt };