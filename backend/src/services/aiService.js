// aiService.js
//
// Day 6: this file called the Groq HTTP API directly with a raw fetch().
// Day 7: this file now goes through LangChain instead — but its public
// interface, getAIResponse(conversationHistory), is EXACTLY THE SAME as
// before. That's the whole point: chatController.js does not change AT
// ALL for this integration. It never knew HOW we talked to the LLM, only
// that this function exists and returns a string.

const { getChatModel } = require("../ai/models/chatModel");
const { chatPrompt } = require("../ai/prompts/chatPrompt");
const { HumanMessage, AIMessage } = require("@langchain/core/messages");

// Takes the full message history for a conversation (from MongoDB,
// INCLUDING the just-saved newest user message) and returns the AI's
// reply as a plain string. Throws a typed Error on any failure, same
// convention as Day 6.
async function getAIResponse(conversationHistory) {
  if (!process.env.LLM_API_KEY) {
    const err = new Error("LLM_API_KEY is not configured");
    err.type = "CONFIG_ERROR";
    throw err;
  }

  // The prompt template has two slots: {history} (everything BEFORE the
  // newest message) and {question} (the newest message itself). So we
  // split the incoming array: the last item is the question, everything
  // before it becomes typed LangChain message objects for {history}.
  const last = conversationHistory[conversationHistory.length - 1];
  const priorMessages = conversationHistory.slice(0, -1).map((m) =>
    m.role === "assistant" ? new AIMessage(m.content) : new HumanMessage(m.content)
  );

  try {
    const model = getChatModel();

    // .pipe() is LangChain's way of composing a chain: "run the prompt
    // template first, feed its output into the model next." This IS a
    // chain, in the LangChain sense — just a very small, two-step one.
    const chain = chatPrompt.pipe(model);

    const result = await chain.invoke({
      history: priorMessages,
      question: last.content,
    });

    if (!result?.content) {
      const err = new Error("LLM provider returned an empty response");
      err.type = "EMPTY_RESPONSE";
      throw err;
    }

    return result.content;
  } catch (err) {
    if (err.type) throw err; // already one of our typed errors — pass through as-is

    // LangChain/Groq SDK errors carry a status code buried in different
    // places depending on the failure — normalize it into the same typed
    // error shape Day 6 established, so the controller's handling doesn't
    // need to know anything changed underneath.
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