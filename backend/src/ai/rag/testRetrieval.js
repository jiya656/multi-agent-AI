require("dotenv").config();

const retrieveDocuments = require("./retrieveDocuments");

const run = async () => {
  const results = await retrieveDocuments("What projects has this person built?");
  console.log(JSON.stringify(results, null, 2));
};

run();