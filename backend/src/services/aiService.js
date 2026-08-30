// aiService.js
//
// Day 6: raw fetch() call to Groq.
// Day 7: LangChain (prompt -> model chain).
// Day 8: grew a tool-calling loop.
// Day 9: that loop moved into ai/agents/agent.js.
// Day 10: aiService now calls ai/graph/graph.js instead of the agent
// directly. It doesn't know or care that there's a graph with state,
// nodes, and edges underneath — only that runGraph() takes a message +
// history and returns a response string. Same pattern as every previous
// day: getAIResponse()'s outside behavior is unchanged, so
// chatController.js STILL needs zero changes.

const { HumanMessage, AIMessage } = require("@langchain/core/messages");
const { runGraph } = require("../ai/graph/graph");

// Takes the full message history for a conversation (from MongoDB,
// INCLUDING the just-saved newest user message) and returns the AI's
// reply as a plain string. Throws a typed Error on any failure.
async function getAIResponse(conversationHistory) {
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
    const responseText = await runGraph(last.content, priorMessages);

    if (!responseText) {
      const err = new Error("LLM provider returned an empty response");
      err.type = "EMPTY_RESPONSE";
      throw err;
    }

    return responseText;
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