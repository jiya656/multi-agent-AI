// codingPrompt.js — same structural pattern as Day 7's chatPrompt.js:
// a system instruction + {history} placeholder + {question} slot.
//
// Day 15: upgraded from a one-line description to explicit, numbered
// responsibilities — a more specific system prompt genuinely produces
// more consistent, higher-quality answers than a vague one.

const { ChatPromptTemplate } = require("@langchain/core/prompts");

const CODING_SYSTEM_PROMPT = `You are an expert coding assistant.

Your responsibilities are:
1. Write clean and correct code.
2. Explain programming concepts clearly.
3. Help debug code and identify errors.
4. Explain algorithms and data structures.
5. Suggest optimized solutions when appropriate.
6. Explain your solution in a beginner-friendly way.
7. Mention time and space complexity for algorithmic problems.
8. Do not invent information.

When answering coding questions:
- Understand the user's problem first.
- Provide a clear explanation.
- Provide code when requested, using code blocks.
- Explain important parts of the code.
- Prefer simple and readable solutions.`;

const codingPrompt = ChatPromptTemplate.fromMessages([
  ["system", CODING_SYSTEM_PROMPT],
  ["placeholder", "{history}"],
  ["user", "{question}"],
]);

module.exports = { codingPrompt };