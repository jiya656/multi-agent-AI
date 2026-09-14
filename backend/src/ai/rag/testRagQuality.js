require("dotenv").config();

const { runDocumentAgent } = require("../agents/documentAgent");

const run = async () => {
  console.log("--- Test 1: Relevant question, correct document ---");
  const r1 = await runDocumentAgent("What projects has this person built?", [], "demo-document-1");
  console.log("Answer:", r1.answer);
  console.log("Sources:", r1.sources);

  console.log("\n--- Test 2: Irrelevant question, correct document ---");
  const r2 = await runDocumentAgent("What is photosynthesis?", [], "demo-document-1");
  console.log("Answer:", r2.answer);
  console.log("Sources:", r2.sources);

  console.log("\n--- Test 3: Relevant question, wrong document ---");
  const r3 = await runDocumentAgent("What projects has this person built?", [], "demo-document-2");
  console.log("Answer:", r3.answer);
  console.log("Sources:", r3.sources);
};

run();