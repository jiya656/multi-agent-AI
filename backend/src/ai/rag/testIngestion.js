require("dotenv").config();

const ingestDocument = require("./ingestDocument");

const run = async () => {
  await ingestDocument(
    "./test-data/JiyaSem.pdf",
    "demo-document-2"
  );
};

run();