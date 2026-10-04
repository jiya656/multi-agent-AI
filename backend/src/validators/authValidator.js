const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

module.exports = { registerSchema, loginSchema };