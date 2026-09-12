require("dotenv").config();

const { runDocumentAgent } = require("../agents/documentAgent");

const run = async () => {
  const response = await runDocumentAgent(
    "What projects has this person built?",
    []
  );

  console.log("\nFINAL ANSWER:\n");
  console.log(response);
};

run();