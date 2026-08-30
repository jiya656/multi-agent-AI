// router.js
//
// A router answers exactly one question: "given the current state, which
// node should run next?" It does NOT perform any work itself — it only
// returns the NAME of the node that should. This distinction matters:
// classifyMessage (in graph.js) does the deciding-what-category work;
// this file only translates that decision into a destination name.

function router(state) {
  const destination = state.category === "coding" ? "codingNode" : "generalNode";
  console.log("[router] category:", state.category, "-> routing to:", destination);
  return destination;
}

module.exports = { router };