// agentNode.js
//
// STEP 14: this node's whole job is: look at the conversation so far,
// ask the LLM what to do next, and record whatever it says. The MODEL
// decides for itself whether it needs a tool — this function doesn't
// make that decision, it just asks the question and appends the answer
// to the message list.

const { getChatModel } = require("../../models/chatModel");
const { calculatorTool } = require("../../tools/calculatorTool");

const TOOLS = [calculatorTool];

async function agentNode(state) {
  const model = getChatModel().bindTools(TOOLS);

  console.log("[agentNode] messages in:", state.messages.length);
  const response = await model.invoke(state.messages);
  console.log("[agentNode] tool call requested?", Boolean(response.tool_calls?.length));

  // MessagesAnnotation's default reducer APPENDS returned messages to
  // the existing list, rather than replacing it — unlike the plain
  // Annotation() fields we used on Days 10-11. This is why we only
  // return the NEW message here, not the whole growing conversation.
  return { messages: [response] };
}

module.exports = { agentNode, TOOLS };