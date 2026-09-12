// documentPrompt.js — same structural pattern as codingPrompt.js and
// researchPrompt.js: a system instruction + {history} placeholder +
// {question} slot.
//
// Day 23 update: RAG retrieval is now actually connected. The Day 13/17
// "RAG isn't connected yet, say so" clause is now FALSE and has been
// replaced — leaving it in would make the LLM contradict itself against
// real retrieved context. The new honesty clause is narrower but just as
// important: only claim knowledge that's actually in the retrieved
// excerpts, and say so plainly if the context doesn't contain the answer.

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

Important: you only ever see a small number of retrieved excerpts from the
user's document, not the entire document. If the provided context doesn't
contain enough information to answer the question, say so honestly rather
than guessing or inventing an answer.`;

const documentPrompt = ChatPromptTemplate.fromMessages([
  ["system", DOCUMENT_SYSTEM_PROMPT],
  ["placeholder", "{history}"],
  ["user", `Relevant document context:

{context}

User question:
{question}

Answer the question using the provided document context.`],
]);

module.exports = { documentPrompt };