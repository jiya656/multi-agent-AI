require("dotenv").config();

const { runDocumentAgent } = require("../agents/documentAgent");

const run = async () => {
  console.log("--- Asking about resume, filtered to demo-document-1 ---");
  const r1 = await runDocumentAgent(
    "What projects has this person built?",
    [],
    "demo-document-1"
  );
  console.log(r1);

  console.log("\n--- Asking the SAME question, filtered to demo-document-2 (wrong doc) ---");
  const r2 = await runDocumentAgent(
    "What projects has this person built?",
    [],
    "demo-document-2"
  );
  console.log(r2);
};

run();