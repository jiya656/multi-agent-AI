// aiService.js
//
// Day 6: this file called the Groq HTTP API directly with a raw fetch().
// Day 7: went through LangChain instead — but its public interface,
// getAIResponse(conversationHistory), stayed EXACTLY THE SAME. That's
// the whole point: chatController.js does not change AT ALL for this
// integration. It never knew HOW we talked to the LLM, only that this
// function exists and returns a string.
// Day 8: now runs a full tool-calling loop — the model can request a
// tool (like the calculator) instead of just generating text directly.

const { getChatModel } = require("../ai/models/chatModel");
const { chatPrompt } = require("../ai/prompts/chatPrompt");
const { HumanMessage, AIMessage, ToolMessage } = require("@langchain/core/messages");
const { calculatorTool } = require("../ai/tools/calculatorTool");

// The set of tools our model can choose to call. Adding a new tool later
// (searchTool, documentSearchTool, etc.) means adding it to this array —
// nothing else in this file needs to change to support it.
const TOOLS = [calculatorTool];
const TOOLS_BY_NAME = Object.fromEntries(TOOLS.map((t) => [t.name, t]));

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
    // bindTools() attaches our tool definitions (name + description +
    // schema) to the model. This does NOT make the model execute
    // anything — it only gives the model the OPTION to respond with a
    // request to call one of these tools, instead of (or in addition to)
    // generating text directly.
    const model = getChatModel().bindTools(TOOLS);

    // We use formatMessages() here instead of the simpler .pipe() chain
    // from Day 7, because the tool-calling loop needs the raw message
    // array to grow (adding the tool call + tool result) between two
    // separate calls to the model — a single .pipe().invoke() can't
    // express that back-and-forth.
    const messages = await chatPrompt.formatMessages({
      history: priorMessages,
      question: last.content,
    });

    let response = await model.invoke(messages);

    // Did the model ask for a tool instead of (or before) answering directly?
    if (response.tool_calls && response.tool_calls.length > 0) {
      messages.push(response); // the model's own tool-call request joins the conversation

      for (const call of response.tool_calls) {
        const toolFn = TOOLS_BY_NAME[call.name];
        let toolResult;
        try {
          toolResult = toolFn
            ? await toolFn.invoke(call.args)
            : `Error: unknown tool "${call.name}"`;
        } catch (toolErr) {
          // A tool failing shouldn't crash the whole request — feed the
          // error back to the model as the tool's result, and let it
          // explain the problem in its final answer instead.
          toolResult = `Error running tool: ${toolErr.message}`;
        }

        // ToolMessage links a result back to the SPECIFIC tool call that
        // requested it, via tool_call_id — required when a model makes
        // multiple parallel tool calls in one turn.
        messages.push(new ToolMessage({ content: String(toolResult), tool_call_id: call.id }));
      }

      // Second call: the model now sees its own tool request AND the
      // real result, and generates the actual final answer using it.
      response = await model.invoke(messages);
    }

    if (!response?.content) {
      const err = new Error("LLM provider returned an empty response");
      err.type = "EMPTY_RESPONSE";
      throw err;
    }

    return response.content;
  } catch (err) {
    if (err.type) throw err; // already one of our typed errors (e.g. EMPTY_RESPONSE) — pass through as-is

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