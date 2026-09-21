const { HumanMessage, AIMessage } = require("@langchain/core/messages");
const { runGraph } = require("../ai/graph/graph");

// Takes the full message history for a conversation (from MongoDB,
// INCLUDING the just-saved newest user message) and returns the AI's
// reply as { text, sources }. Throws a typed Error on any failure.
async function getAIResponse(conversationHistory, documentId) {
  if (!process.env.LLM_API_KEY) {
    const err = new Error("LLM_API_KEY is not configured");
    err.type = "CONFIG_ERROR";
    throw err;
  }

  // Split the incoming history: the last message is the current
  // question, everything before it becomes typed LangChain message
  // objects that the graph's callModel node will use as {history}.
  const last = conversationHistory[conversationHistory.length - 1];
  const priorMessages = conversationHistory.slice(0, -1).map((m) =>
    m.role === "assistant" ? new AIMessage(m.content) : new HumanMessage(m.content)
  );

  try {
    const { text, sources } = await runGraph(last.content, priorMessages, documentId);

    if (!text) {
      const err = new Error("LLM provider returned an empty response");
      err.type = "EMPTY_RESPONSE";
      throw err;
    }

    return { text, sources };
  } catch (err) {
    if (err.type) throw err; // already one of our typed errors — pass through as-is

    const status = err.status || err.response?.status;
    const wrapped = new Error(err.message || "LLM provider request failed");
    wrapped.type =
      status === 401
        ? "AUTH_ERROR"
        : status === 429
        ? "RATE_LIMIT"
        : status === 404
        ? "PROVIDER_ERROR"
        : "PROVIDER_ERROR";
    wrapped.status = status;
    wrapped.cause = err;
    throw wrapped;
  }
}

module.exports = { getAIResponse };