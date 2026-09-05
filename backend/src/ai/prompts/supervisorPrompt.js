// supervisorPrompt.js
//
// The supervisor's instructions. Used together with a zod schema (see
// agents/supervisorAgent.js) that CONSTRAINS the model's output to one
// of a fixed set of values — this prompt describes the options in plain
// English, but it's the schema that actually guarantees we never get
// back something unexpected (Step 23).
//
// Day 16 fix: broadened the "research" description. It originally only
// mentioned "comparisons" and "latest developments" — testing revealed
// this was too narrow: a real question like "what are the advantages of
// microservices?" was being classified as "end" (general) instead of
// "research", because explaining pros/cons of a technology didn't
// obviously match either of those two original examples. Added explicit
// coverage for that case.

const { ChatPromptTemplate } = require("@langchain/core/prompts");

const SUPERVISOR_SYSTEM_PROMPT =
  "You are the supervisor of a multi-agent AI system.\n\n" +
  "Available agents:\n" +
  "- coding: programming questions, writing or debugging code, explaining programming concepts\n" +
  "- research: gathering or synthesizing information, comparisons, explaining the advantages/disadvantages or pros/cons of a technology or concept, \"what are the latest developments in X\"\n" +
  "- document: questions about a document the user has uploaded\n" +
  "- end: greetings, small talk, or anything that doesn't need a specialist\n\n" +
  "Choose the SINGLE most appropriate option for the user's latest message.";

const supervisorPrompt = ChatPromptTemplate.fromMessages([
  ["system", SUPERVISOR_SYSTEM_PROMPT],
  ["placeholder", "{history}"],
  ["user", "{question}"],
]);

module.exports = { supervisorPrompt };