// router.js
//
// Deliberately trivial — the real decision already happened inside
// supervisorAgent.js, constrained by its zod schema. This function just
// hands that decision (state.next) to LangGraph so it can look up the
// matching destination in graph.js's pathMap.
const { debug } = require("../../utils/logger");
function router(state) {
  debug("[router] supervisor decided:", state.next);
  return state.next;
}

module.exports = { router };