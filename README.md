# Multi-Agent AI Workspace

A full-stack multi-agent AI application built using MERN,
LangChain, LangGraph, RAG, Qdrant, Redis and Docker.

## Current Progress

### Day 1
- Created React frontend
- Created Express backend
- Connected frontend and backend
- Added Git repository

### Day 2
- Created MongoDB Atlas cluster
- Installed and configured Mongoose
- Connected Express backend to MongoDB
- Created the first data model: User (name, email, password, createdAt)
- Added a temporary test endpoint (`POST /api/test/users`) to verify data saves correctly

### Day 3
- Built on the `feature/auth` branch
- Installed bcryptjs and jsonwebtoken
- Implemented `POST /api/auth/register` — hashes password with bcrypt before saving
- Implemented `POST /api/auth/login` — verifies password, returns a signed JWT
- Implemented JWT auth middleware (`protect`) — verifies `Authorization: Bearer <token>`
- Implemented a protected test route: `GET /api/auth/profile`
- Removed the Day 2 temporary `/api/test/users` route (replaced by real registration)

### Day 4
- Built on the `feature/frontend-auth` branch
- Installed Redux Toolkit, React Redux, Axios, React Router
- Created a centralized Axios instance (`services/api.js`) that auto-attaches the JWT to every request
- Created `authSlice.js` with `registerUser`/`loginUser` async thunks and auth state (`user`, `token`, `isAuthenticated`, `loading`, `error`)
- Built Register, Login, and Dashboard pages
- Built `ProtectedRoute` — redirects unauthenticated users to `/login`
- Wired up logout, form validation, and backend error display

### Day 5
- Built on the `feature/chat-system` branch
- Created `Conversation` and `Message` models (one conversation → many messages)
- Built chat REST API: `POST/GET /api/chats`, `GET /api/chats/:id`, `POST /api/chats/:id/messages`, `DELETE /api/chats/:id`
- All chat routes protected by JWT (`authMiddleware`) and scoped by ownership (`user` field checked on every query)
- Cascade delete: removing a conversation also removes its messages
- Built `Chat.jsx` — sidebar + message view, `/chat` and `/chat/:id` routes
- Built `chatSlice.js` — `fetchChats`, `createChat`, `fetchChat`, `sendMessage`, `deleteChat` thunks
- No LLM yet — messages are stored as-is; AI responses come in Day 6

### Day 6
- Built on the `feature/llm-integration` branch
- Added `services/aiService.js` — the only file that talks to the LLM provider (Groq by default, swappable via `.env`)
- `addMessage` now: saves the user message → fetches full conversation history → calls the AI service → saves the assistant reply → returns both messages
- Conversation memory verified: multi-turn context is correctly passed to the model
- AI failures (bad key, rate limit, network error) return a clean `502` with a generic message — technical details stay in server logs only, and the user's message is preserved even if the AI call fails
- Frontend: `sendMessage` now handles the `{userMessage, assistantMessage}` response shape, shows an "AI is thinking…" indicator, and still displays the user's message even on AI failure

### Day 7
- Built on the `feature/langchain-integration` branch
- Installed `@langchain/core` and `@langchain/groq`
- Added `ai/models/chatModel.js` — configures and returns the LangChain chat model, isolated from the rest of the app
- Added `ai/prompts/chatPrompt.js` — reusable `ChatPromptTemplate` with `{history}` and `{question}` slots
- Rewrote `aiService.js` internals to use a LangChain chain (`prompt.pipe(model)`) instead of a raw fetch call — but kept its external interface identical, so `chatController.js` needed zero changes
- Still a single LLM call — no agents, no tools, no RAG yet

### Day 8
- Built on the `feature/ai-tools` branch
- Installed `zod` (for tool input schema validation)
- Added `ai/tools/calculatorTool.js` — first AI tool: name, description, zod schema, and a safe (no `eval()`) implementation
- Rewrote `aiService.js`'s core logic into a full tool-calling loop: bind tools to the model → invoke → if the model requests a tool, execute it for real and feed the result back → invoke again for the final answer
- `chatController.js` still required zero changes
- Not building multiple agents yet — this is the foundation Day 9+ will build on

### Day 9
- Built on the `feature/first-ai-agent` branch
- Added `ai/agents/agent.js` — owns the chat model + tools + the full "should I use a tool?" decision loop
- Extracted the tool-calling loop out of `aiService.js` into `agent.js`; `aiService.js` shrank to a thin coordinator
- `chatController.js` still required zero changes
- Clear responsibility split: `chatController.js` = HTTP logic, `aiService.js` = AI coordination, `agent.js` = agent decision-making, `calculatorTool.js` = tool capability, `chatModel.js` = LLM config

### Day 10
- Built on the `feature/langgraph-basics` branch
- Installed `@langchain/langgraph`
- Added `ai/graph/graph.js` — first LangGraph workflow: state (`message`, `historyMessages`, `response`), two nodes (`processMessage`, `callModel`), edges `START → processMessage → callModel → END`
- `callModel` reuses the existing `runAgent()` (Day 9) internally, so tool-calling and conversation memory are preserved — the graph adds LangGraph's structure without losing existing capability
- `aiService.js` now calls `runGraph()` instead of the agent directly; `chatController.js` still required zero changes
- Verified: state genuinely flows between nodes (tested via a trimmed message reaching the second node correctly), tool-calling still works through the graph, conversation memory still works through the graph

### Day 11
- Built on the `feature/langgraph-routing` branch
- Added `category` to graph state
- Added `ai/graph/router.js` — pure routing decision function
- Rewrote `ai/graph/graph.js`: added `classifyMessage` (keyword-based, deliberately simple), `codingNode`, `generalNode`, and a conditional edge routing between them based on category
- `aiService.js` still required zero changes
- Verified: all 4 plan test cases route correctly (coding vs general), tool-calling and conversation memory still work regardless of which path is taken
- Today's classifier is simple by design — a real LLM/supervisor-based classification comes in a later day

### Day 12
- Built on the `feature/langgraph-agent` branch
- Added `ai/graph/nodes/agentNode.js` — calls the LLM (bound with tools), doesn't decide anything itself
- Added `ai/graph/nodes/toolNode.js` — LangGraph's prebuilt `ToolNode`, executes real tool calls
- Rewrote `graph.js`: the agent is now itself a LangGraph node, with a real loop (`agent → tools → agent`) via `toolsCondition` and a `tools → agent` edge, continuing until no more tool calls are pending
- Replaces Day 11's classify/router graph at the top level — that router was explicitly a disposable teaching scaffold; today's agent+tool loop is the real reusable pattern Day 13's specialized agents will be built from
- `aiService.js` still required zero changes
- Verified with exact model-call counts: no-tool question = 1 call, single calculation = 2 calls (looped once), two sequential calculations = 3 calls (looped twice) — confirms the loop is real and dynamic, not hardcoded to one iteration

### Day 13
- Built on the `feature/multi-agent-architecture` branch
- Added 4 specialized prompts: supervisor, coding, research, document
- Added 4 agents: `supervisorAgent.js` (LLM-powered, schema-constrained routing via zod), `codingAgent.js` (reuses tool-calling from Days 8-9), `researchAgent.js` and `documentAgent.js` (honest placeholders — no search/RAG yet, they say so rather than hallucinating)
- Added `state.js` (`next` field), rewrote `router.js` (trivial — real decision already made by the supervisor), 4 new nodes
- Rewrote `graph.js`: START → supervisorNode → conditional routing → coding/research/document → END. The "end" case is handled directly inside supervisorNode so it produces a real response, not an empty one
- `aiService.js` still required zero changes — 8th consecutive day
- Verified: all 4 plan test cases route correctly with real responses, calculator tool still works inside codingNode
- No return-to-supervisor loop yet (multi-step requests) — deliberately simplified per the plan, coming later

### Day 14
- Confirmed Day 13's supervisor architecture already satisfies Day 14's requirements — no new source files needed
- Verified 3 additional test cases with less obvious phrasing (e.g. "reverse a linked list" with no literal word "code") — supervisor correctly reasoned by meaning, not keyword matching