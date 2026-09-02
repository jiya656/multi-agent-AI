// supervisorPrompt.js
//
// The supervisor's instructions. Used together with a zod schema (see
// agents/supervisorAgent.js) that CONSTRAINS the model's output to one
// of a fixed set of values — this prompt describes the options in plain
// English, but it's the schema that actually guarantees we never get
// back something unexpected (Step 23).

const { ChatPromptTemplate } = require("@langchain/core/prompts");

const supervisorPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are the supervisor of a multi-agent AI system.\n\n" +
      "Available agents:\n" +
      "- coding: programming questions, writing or debugging code, explaining programming concepts\n" +
      "- research: gathering or synthesizing information, comparisons, \"what are the latest developments in X\"\n" +
      "- document: questions about a document the user has uploaded\n" +
      "- end: greetings, small talk, or anything that doesn't need a specialist\n\n" +
      "Choose the SINGLE most appropriate option for the user's latest message.",
  ],
  ["placeholder", "{history}"],
  ["user", "{question}"],
]);

module.exports = { supervisorPrompt };