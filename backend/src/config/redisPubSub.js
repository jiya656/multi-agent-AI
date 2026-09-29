// redisPubSub.js
// Day 38: worker (separate process) publishes document status events;
// the API server subscribes and forwards them to Socket.IO clients.
// A subscribing connection enters subscriber mode and can't run normal
// commands, so publisher and subscriber are separate connections.

const { createClient } = require("redis");

const publisher = createClient({ url: process.env.REDIS_URL });
const subscriber = publisher.duplicate();

publisher.on("error", (err) => console.error("Redis Publisher Error:", err));
subscriber.on("error", (err) => console.error("Redis Subscriber Error:", err));

const connectPublisher = async () => {
  if (!publisher.isOpen) {
    await publisher.connect();
    console.log("Redis publisher connected");
  }
};

const connectSubscriber = async () => {
  if (!subscriber.isOpen) {
    await subscriber.connect();
    console.log("Redis subscriber connected");
  }
};

module.exports = { publisher, subscriber, connectPublisher, connectSubscriber };