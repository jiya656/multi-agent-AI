// aiService.js
//
// Day 6: raw fetch() call to Groq directly.
// Day 7: went through LangChain (a simple prompt->model chain) instead.
// Day 8: grew a tool-calling loop, all still inside this one file.
// Day 9: that loop moved OUT into ai/agents/agent.js. This file's job
// shrank down to: prepare the conversation as LangChain messages, hand
// them to the agent, and translate whatever happens into either a plain
// string or a typed error. It doesn't know HOW the agent decides to
// respond — only that runAgent() will figure that out.
//
// getAIResponse()'s signature and behavior from the OUTSIDE are still
// identical to Day 6 — chatController.js has needed zero changes since
// the very first LLM integration.

const { chatPrompt } = require("../ai/prompts/chatPrompt");
const { HumanMessage, AIMessage } = require("@langchain/core/messages");
const { runAgent } = require("../ai/agents/agent");

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
  // objects for the {history} slot in our prompt template.
  const last = conversationHistory[conversationHistory.length - 1];
  const priorMessages = conversationHistory.slice(0, -1).map((m) =>
    m.role === "assistant" ? new AIMessage(m.content) : new HumanMessage(m.content)
  );

  try {
    const messages = await chatPrompt.formatMessages({
      history: priorMessages,
      question: last.content,
    });

    // Everything about WHETHER a tool gets used, and HOW the tool-calling
    // round trip works, is entirely the agent's responsibility now.
    const response = await runAgent(messages);

    if (!response?.content) {
      const err = new Error("LLM provider returned an empty response");
      err.type = "EMPTY_RESPONSE";
      throw err;
    }

    return response.content;
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