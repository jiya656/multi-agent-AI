// agent.js
//
// This is our first real "agent" in the architectural sense: it's given
// a conversation and a set of capabilities (a chat model + tools), and it
// DECIDES what to do — answer directly, or request a tool first — rather
// than following one fixed, predetermined sequence.
//
// What this file does NOT know about (deliberately):
//   - HTTP requests/responses (that's chatController.js's job)
//   - MongoDB (that's chatController.js's job)
//   - JWT/authentication (that's authMiddleware.js's job)
//   - How conversation history was fetched or formatted (that's
//     aiService.js's job, one layer up)
//
// This file only knows: "given these messages, and these tools, decide
// how to respond." That's the entire scope of an agent's responsibility.

const { getChatModel } = require("../models/chatModel");
const { ToolMessage } = require("@langchain/core/messages");
const { calculatorTool } = require("../tools/calculatorTool");

// The tools THIS agent has access to. A future ResearchAgent or
// DocumentAgent would be a separate file with its own TOOLS array —
// agents don't have to share the same toolset.
const TOOLS = [calculatorTool];
const TOOLS_BY_NAME = Object.fromEntries(TOOLS.map((t) => [t.name, t]));

// Runs one full agent turn. Takes a prepared array of LangChain messages
// (system prompt + conversation history + the newest question) and
// returns the model's final response object (with a .content string).
//
// Internally, this is the "should I use a tool?" decision loop:
//   1. Ask the model, with tools available as an option
//   2. If it asks for a tool, actually run that tool for real
//   3. Feed the real result back and ask again for the final answer
//   4. If it never asked for a tool, step 1's response IS the final answer
async function runAgent(messages) {
  const model = getChatModel().bindTools(TOOLS);

  let response = await model.invoke(messages);

  // This IS the agent's decision point. Everything before this line is
  // just "ask the model." This check is what turns that into "the model
  // gets to choose its own next action."
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
        // A tool failing (bad args, division by zero, etc.) shouldn't
        // crash the agent — feed the error back as the "result," and let
        // the model explain the problem in its final answer.
        toolResult = `Error running tool: ${toolErr.message}`;
      }

      messages.push(new ToolMessage({ content: String(toolResult), tool_call_id: call.id }));
    }

    // Second call: the model now has its own request AND the real
    // result in context, and generates the actual final answer.
    response = await model.invoke(messages);
  }

  return response;
}

module.exports = { runAgent };