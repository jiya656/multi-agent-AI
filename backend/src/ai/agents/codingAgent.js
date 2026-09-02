// codingAgent.js
//
// A real, working specialist — reuses the same tool-calling pattern from
// Days 8-9, just with a coding-specific system prompt and its own tool
// list (today: calculator, since that's what we've built; a real
// code-analysis or sandboxed-execution tool would slot in here later).

const { getChatModel } = require("../models/chatModel");
const { codingPrompt } = require("../prompts/codingPrompt");
const { calculatorTool } = require("../tools/calculatorTool");
const { ToolMessage } = require("@langchain/core/messages");

const TOOLS = [calculatorTool];
const TOOLS_BY_NAME = Object.fromEntries(TOOLS.map((t) => [t.name, t]));

async function runCodingAgent(message, historyMessages = []) {
  const messages = await codingPrompt.formatMessages({
    history: historyMessages,
    question: message,
  });

  const model = getChatModel().bindTools(TOOLS);
  let response = await model.invoke(messages);

  if (response.tool_calls && response.tool_calls.length > 0) {
    messages.push(response);
    for (const call of response.tool_calls) {
      const toolFn = TOOLS_BY_NAME[call.name];
      let result;
      try {
        result = toolFn ? await toolFn.invoke(call.args) : `Error: unknown tool "${call.name}"`;
      } catch (err) {
        result = `Error running tool: ${err.message}`;
      }
      messages.push(new ToolMessage({ content: String(result), tool_call_id: call.id }));
    }
    response = await model.invoke(messages);
  }

  return response.content;
}

module.exports = { runCodingAgent };