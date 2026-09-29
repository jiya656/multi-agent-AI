require("dotenv").config();

const connectDB = require("./src/config/database");
const { connectPublisher } = require("./src/config/redisPubSub");
require("./src/jobs/workers/documentWorker");

Promise.all([connectDB(), connectPublisher()]).then(() => {
  console.log("Document worker started");
});