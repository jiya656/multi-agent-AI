// calculatorTool.js
//
// Our first AI tool. Every LangChain tool needs exactly four things:
//   1. A NAME       — how the model refers to this tool
//   2. A DESCRIPTION — how the model decides WHEN to use it (this matters
//                      more than it looks — a vague description means the
//                      model won't reliably reach for the tool)
//   3. An INPUT SCHEMA — the exact shape of arguments the model must
//                         produce, enforced with zod so malformed calls
//                         are rejected before our function even runs
//   4. A FUNCTION    — the actual code that performs the operation
//
// SECURITY NOTE: we deliberately do NOT use eval() or Function() to
// evaluate a math expression string. Executing arbitrary text as
// JavaScript is a classic remote-code-execution risk — instead, the model
// is constrained to producing exactly {a, b, operation}, and we run a
// fixed, safe switch statement over a closed set of operations.

const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const calculatorSchema = z.object({
  a: z.number().describe("The first number"),
  b: z.number().describe("The second number"),
  operation: z
    .enum(["add", "subtract", "multiply", "divide"])
    .describe("The arithmetic operation to perform"),
});

const calculatorTool = tool(
  async ({ a, b, operation }) => {
    // Tools must return a STRING — the model reads this back as text,
    // even for a numeric result.
    switch (operation) {
      case "add":
        return String(a + b);
      case "subtract":
        return String(a - b);
      case "multiply":
        return String(a * b);
      case "divide":
        if (b === 0) return "Error: division by zero is undefined";
        return String(a / b);
      default:
        // zod's enum already blocks this at the schema level, but this
        // stays as a defensive fallback — never trust a single layer of
        // validation alone.
        return `Error: unsupported operation "${operation}"`;
    }
  },
  {
    name: "calculator",
    description:
      "Performs basic arithmetic (add, subtract, multiply, divide) on two numbers. Use this whenever the user asks for a numeric calculation, instead of computing it yourself from memory.",
    schema: calculatorSchema,
  }
);

module.exports = { calculatorTool };