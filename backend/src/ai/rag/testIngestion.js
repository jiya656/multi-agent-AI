require("dotenv").config();

const ingestDocument = require("./ingestDocument");

const run = async () => {
  await ingestDocument(
    "./test-data/Jiya_Kant_Resume.pdf",
    "demo-document-1"
  );
};

run();