// graph.js
//
// Day 10: straight-line graph.
// Day 11: branching graph (classify -> coding/general) — an explicitly
// disposable teaching scaffold, described in that day's own notes as "a
// simplified foundation for the future supervisor."
// Day 12: the agent ITSELF becomes a graph. agentNode decides what to do;
// if it requests a tool, execution loops through toolNode and back to
// agentNode, repeating until the agent produces a final answer with no
// further tool calls pending. This Tool -> Agent loop is the real
// reusable pattern Day 13's Coding/Research/Document agents will each be
// built from — today's graph replaces yesterday's toy example at the top
// level for exactly that reason.

const { StateGraph, MessagesAnnotation, START, END } = require("@langchain/langgraph");
const { toolsCondition } = require("@langchain/langgraph/prebuilt");
const { SystemMessage, HumanMessage } = require("@langchain/core/messages");
const { agentNode } = require("./nodes/agentNode");
const { toolNode } = require("./nodes/toolNode");

const SYSTEM_PROMPT =
  "You are a helpful AI assistant inside a multi-agent AI workspace. Be clear and concise.";

// STEP 11: the loop, made concrete.
//   START -> agent -> (toolsCondition checks the last message) -> "tools" or END
//   tools -> agent   <-- THIS edge is what creates the loop
// toolsCondition is LangGraph's prebuilt router: it inspects the most
// recent message and returns "tools" if it has pending tool_calls,
// otherwise END. We don't write this routing logic ourselves — it's the
// same "does the last AI message contain a tool call?" check we'd have
// hand-written, just provided as a maintained utility.
const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", agentNode)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", toolsCondition, ["tools", END])
  .addEdge("tools", "agent")
  .compile();

// Same external interface as every previous day: message + prior history
// in, final answer text out. aiService.js doesn't need to know a loop
// exists underneath.
async function runGraph(message, historyMessages = []) {
  const initialMessages = [
    new SystemMessage(SYSTEM_PROMPT),
    ...historyMessages,
    new HumanMessage(message),
  ];

  const finalState = await graph.invoke({ messages: initialMessages });

  // By the time execution reaches END, toolsCondition has already
  // confirmed the last message has no pending tool calls — so it's
  // guaranteed to be the agent's real final answer, not a tool request.
  const lastMessage = finalState.messages[finalState.messages.length - 1];
  return lastMessage.content;
}

module.exports = { runGraph };