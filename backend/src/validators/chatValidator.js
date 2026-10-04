const { z } = require("zod");

// Note: no conversationId field here — your real route is
// POST /:id/messages, so the ID comes from the URL param, not the
// request body (unlike the plan's example, which assumed a body field).
const chatSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message content is required")
    .max(10000, "Message is too long"),
  documentId: z.string().nullable().optional(),
});

module.exports = { chatSchema };