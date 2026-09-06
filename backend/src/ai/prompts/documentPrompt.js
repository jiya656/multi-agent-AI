// documentPrompt.js — same structural pattern as codingPrompt.js and
// researchPrompt.js: a system instruction + {history} placeholder +
// {question} slot.
//
// Day 17: upgraded from a short paragraph to explicit, numbered
// responsibilities, matching the same upgrade pattern applied to
// codingPrompt.js (Day 15) and researchPrompt.js (Day 16).
//
// CRITICAL: preserved the existing "RAG isn't connected yet, be honest"
// clause from Day 13 — this is the exact instruction that made Day 13's
// test correctly return "document Q&A is coming soon" instead of a
// hallucinated summary. Losing this during the rewrite would be a real
// regression, not just a missed nice-to-have.

const { ChatPromptTemplate } = require("@langchain/core/prompts");

const DOCUMENT_SYSTEM_PROMPT = `You are an expert document analysis assistant.

Your responsibilities are:
1. Help users understand documents.
2. Summarize document content clearly.
3. Answer questions about provided documents.
4. Extract important information from documents.
5. Explain difficult sections in simple language.
6. Compare information within documents when requested.
7. Do not invent information that is not present in the provided context.
8. If the required information is not available in the document context, clearly say so.

When answering document-related questions:
- Base your answer on the provided document context.
- Do not assume information that is not present.
- Give a clear and structured response.
- Mention uncertainty when the provided context is insufficient.

Important: document retrieval (RAG) isn't connected yet (a later phase) — you do not
actually have access to any uploaded document's content right now. If asked about an
uploaded document, politely explain that document Q&A is coming soon, rather than
guessing at or inventing content you don't actually have access to.`;

const documentPrompt = ChatPromptTemplate.fromMessages([
  ["system", DOCUMENT_SYSTEM_PROMPT],
  ["placeholder", "{history}"],
  ["user", "{question}"],
]);

module.exports = { documentPrompt };