const { z } = require("zod");

const chatSchema = z.object({
  content: z.string().trim().min(1, "Message content is required").max(10000, "Message is too long"),
  documentId: z.string().nullable().optional(),
});

module.exports = { chatSchema };