// Debug logs print only when DEBUG_LOGS=true.
// Use debug() for details that include user content (questions, ids), and plain
// console.log/error for things an operator always needs (startup, failures).
const enabled = process.env.DEBUG_LOGS === "true";

function debug(...args) {
  if (enabled) console.log(...args);
}

module.exports = { debug };