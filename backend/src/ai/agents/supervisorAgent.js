// supervisorAgent.js
//
// Responsible for exactly ONE decision: "who should handle this?" —
// never "how do I solve this?" (that's each specialist's job).
//
// STEP 23's important engineering detail: we don't trust the model to
// return an arbitrary string. .withStructuredOutput(routeSchema)
// constrains the model's output to match this exact zod schema — if the
// model tried to return something like "banana", the underlying
// validation would reject it, not our own string-matching code.

const { z } = require("zod");
const { getChatModel } = require("../models/chatModel");
const { supervisorPrompt } = require("../prompts/supervisorPrompt");

const routeSchema = z.object({
  next: z
    .enum(["coding", "research", "document", "end"])
    .describe("Which specialized agent should handle this request, or 'end' if no specialist is needed."),
});

async function decideRoute(message, historyMessages = []) {
  const messages = await supervisorPrompt.formatMessages({
    history: historyMessages,
    question: message,
  });

  const model = getChatModel().withStructuredOutput(routeSchema);
  const result = await model.invoke(messages);

  console.log("[supervisorAgent] decided:", result.next);
  return result.next;
}

module.exports = { decideRoute };