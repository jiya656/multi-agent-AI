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

### Day 15
- Confirmed `codingAgent.js` and `codingNode.js` already satisfy Day 15's requirements from Day 13 — and are more capable than the plan's simpler version (ours already includes tool-calling + conversation memory, which today's plan's version doesn't)
- Upgraded `codingPrompt.js`'s system instructions: from a one-line description to 8 explicit numbered responsibilities (clean code, debugging, algorithm explanations, complexity analysis, "do not invent information," beginner-friendly explanations)
- Verified 4 test cases: binary search explanation, segfault debugging, a specific LeetCode problem — all correctly routed to `coding`; a stock market question correctly routed to `research`, not `coding`

### Day 16
- Confirmed `researchAgent.js` and `researchNode.js` already satisfy Day 16's requirements from Day 13
- Upgraded `researchPrompt.js`'s system instructions to the detailed 9-point responsibilities from today's plan (distinguish facts from assumptions, don't invent sources, organize with headings/bullets when useful) — kept the existing honesty clause about not having live web search yet
- Verified: microservices, database comparison, and "latest AI developments" all correctly route to `research`; a coding question still correctly routes to `coding`, confirming no regression
- Important interview point (per the plan): the Research Agent does NOT actually search the web yet — it answers from the model's existing knowledge and is explicitly instructed to be honest about that limitation, not imply real-time search capability it doesn't have

### Day 17
- Confirmed `documentAgent.js` and `documentNode.js` already satisfy Day 17's requirements from Day 13
- Upgraded `documentPrompt.js`'s system instructions to the detailed 8-point responsibilities from today's plan, while carefully preserving Day 13's critical "RAG isn't connected yet, be honest" clause — this is the exact instruction that prevents hallucinated document summaries
- Caught and fixed my own testing mistake: initially tested against the OLD prompt content because I forgot to actually apply the file update before running verification — re-tested correctly afterward
- Verified all 3 routes: coding, research, and document (with correct honest disclosure) all work correctly
- Now have a complete 3-agent skeleton: coding, research, document — each with its own prompt, agent, and node file

### Day 19
- Set up Qdrant locally via Docker (ports 6333 HTTP / 6334 gRPC)
- Installed `@qdrant/js-client-rest` and added `QDRANT_URL` to `.env` / `.env.example`
- Created `ai/vector/qdrantClient.js` — single shared Qdrant connection (loads dotenv itself since these scripts run standalone, not through server.js)
- Created `ai/vector/createCollection.js` — creates the `documents` collection (demo 4-dim vectors, Cosine distance)
- Created `ai/vector/insertVector.js` and `searchVector.js` — verified insert + similarity search work end-to-end with a manual demo vector
- Confirmed via Qdrant dashboard that the collection and point exist
- Real embedding dimension will replace the demo `size: 4` once an embedding model is chosen (Day 20)

### Day 20
- Discovered mid-implementation that `@langchain/community` was officially sunset (archived May 2026) — pivoted to calling `@huggingface/transformers` directly instead of through LangChain's wrapper
- Upgraded `@langchain/core` (→ 1.2.9) and `@langchain/groq` (→ 1.3.1) together to resolve a peer dependency requirement — verified via Postman that the existing chat/agent flow still works correctly after the upgrade
- Chose local, free embeddings (Xenova/all-MiniLM-L6-v2 via Hugging Face Transformers.js) instead of OpenAI, since Groq has no embedding models of its own
- Created `ai/models/embeddingModel.js` — local embedding model, no API key, downloads weights once (~90MB) and caches them; added progress logging since the first run has no visible output otherwise
- Created `ai/vector/createDocumentCollection.js` — real `document_chunks` collection sized to 384 dimensions
- Created `ai/rag/textSplitter.js` — chunks text with 1000-char chunks, 200-char overlap
- Created `ai/rag/testRag.js` — verified end-to-end: real text → real embeddings → Qdrant storage → similarity search → correctly retrieved the supervised-learning chunk for a real question (top score 0.85 vs 0.57 for the next closest)
- Not yet done: actual PDF upload/ingestion (Day 21+)

### Day 21
- Corrected a mistake from Day 20's notes: `@langchain/community` is NOT deprecated — verified via npm registry directly. Previous confusion was conflating it with a different, similarly-named repo
- Installed `@langchain/community` + `pdf-parse` for real PDF text extraction — installed cleanly since `@langchain/core` was already upgraded to 1.x on Day 20
- Created `ai/rag/pdfLoader.js` — extracts text + metadata (page numbers, source) from PDFs
- Created `ai/rag/ingestDocument.js` — full ingestion pipeline: PDF → chunks → local embeddings → Qdrant, reusing Day 20's `embeddingModel.js` and `document_chunks` collection (384-dim) unchanged
- Verified end-to-end with a real PDF via `testIngestion.js`
- Known limitation flagged: sequential `id: index + 1` will collide across multiple documents — needs UUIDs before this becomes multi-document safe

### Day 22
- Created `ai/rag/retrieveDocuments.js` — embeds a question via `embedQuery()`, searches `document_chunks` via Qdrant, returns clean `{ text, score, documentId, metadata }` results
- Corrected for the same `search()` → `query()` API change discovered on Day 19 — the plan's original code would have failed identically
- Verified via `testRetrieval.js` against the collection's current mixed contents (Day 20 demo leftovers + Day 21 resume chunks)
- Understood: embedQuery() vs embedDocuments(), why similarity score isn't "correctness," why retrieving too many chunks can hurt rather than help, why document-level filtering (Qdrant payload filtering) will eventually be needed once multiple documents coexist

### Day 23
- Corrected the plan's assumed `documentAgent.js` structure to match the actual Day 17 implementation (`runDocumentAgent(message, historyMessages)` using `documentPrompt.formatMessages()`, not a raw string prompt)
- Critical update: removed/replaced the Day 13/17 "RAG isn't connected yet" honesty clause in `documentPrompt.js` — that instruction is now false and would have contradicted real retrieved context. Replaced with a narrower honesty clause: only claim what's in the retrieved excerpts, say so if the context is insufficient
- Added a `{context}` placeholder to `documentPrompt.js`'s user message template
- Connected `retrieveDocuments.js` (already fixed for `search()`→`query()` on Day 22) into `documentAgent.js` — retrieves 3 chunks, formats them as numbered sources, passes them as context
- Verified end-to-end via `testDocumentAgent.js`: real question → real retrieval from resume → real grounded answer, no more "coming soon" placeholder response
- Known limitations carried forward: no score threshold (irrelevant chunks would still get passed to the LLM), no document-level filtering (searches all chunks regardless of which document), ID collisions still possible with multiple documents

### Day 24
- Added `documentId` to `GraphState` (matching the project's actual singular `message` state shape, not the plan's generic `messages` array assumption)
- Updated `retrieveDocuments.js` with Qdrant metadata filtering (`filter.must[].match`) restricting search to a specific `documentId`, plus a score threshold (0.5, to be tuned) dropping low-relevance results
- Updated `documentAgent.js` to accept and pass through `documentId`, and to honestly respond "I couldn't find relevant information..." when nothing passes the threshold, instead of guessing
- Updated `documentNode.js` to pass `state.documentId` through — the one node that DID need a change this time, unlike Day 23
- Verified with two separately-ingested documents: correct document returns a real grounded answer, wrong document correctly returns nothing found
- Not yet done: userId-based filtering / multi-user document ownership (flagged in the plan as a future security concern once JWT-based auth connects to document access)

### Day 25
- Implemented the full structured `{ answer, sources }` return from `documentAgent.js`, propagated end-to-end: `documentNode.js` → `graph.js` (`runGraph` now returns `{ text, sources }`) → `aiService.js` (`getAIResponse` returns `{ text, sources }`) → `chatController.js` → `Message` schema (new `sources` field)
- Added `sources` to `GraphState` with a safe empty-array default, so coding/research agents (which never set it) don't break
- Added `formatContext.js` and `formatSources.js`, adapted to this project's actual metadata shape (`metadata.source` path + `metadata.loc.pageNumber`)
- Verified via Postman that coding/research agents still work correctly and return `sources: []`, and that document questions now return both a real answer and populated source citations in the API response
- This was a larger, coordinated change across 7 files rather than an isolated `documentAgent.js` edit — necessary because the project's existing string-only contract (aiService → chatController → Message.content) had no room for a sources field without updating the whole chain together

### Day 26
- Added `Document.js` model (MongoDB) tracking uploaded PDFs — filename, path, processing status, owner
- Added Multer-based `uploadMiddleware.js` (PDF-only, 10MB limit)
- Added `documentService.js` coordinating MongoDB record creation + `ingestDocument.js` (unchanged since Day 21 — already accepted `(filePath, documentId)`)
- Added `documentController.js` + `documentRoutes.js`, protected with the same `protect` JWT middleware as `chatRoutes.js` — `userId` comes from `req.user.id` (verified token), never trusted from the request body, per Day 24's security notes
- Mounted `/api/documents` in `server.js`
- Verified end-to-end via Postman: real PDF upload → MongoDB record with `status: completed` → matching chunks in Qdrant with the correct `documentId`
- **Known gap, NOT solved today:** chat messages still have no way to specify which `documentId` to query, and the Supervisor still has no routing logic connecting a question to the Document Agent (confirmed broken via Postman on Day 25). Today only builds the upload/ingestion half — the chat-side wiring is still open

### Day 27
- Adapted to actual frontend conventions: no separate `documentApi.js` service file (chatSlice.js already established the pattern of calling the shared `api` axios instance directly inside thunks) — `documentSlice.js` follows that exact style
- Confirmed no new npm installs needed — axios, Redux Toolkit, react-router-dom, cors all already present since earlier days
- Upload now correctly authenticated: the shared `api.js` interceptor auto-attaches the JWT, satisfying Day 26's `protect` middleware requirement (the original plan's plain `fetch()` would have failed with 401)
- Added `/documents` route (protected, matching the `/chat` pattern) instead of an unrouted floating page
- Verified end-to-end through the real UI: login → select PDF → upload → confirmed in React, MongoDB, and Qdrant

### Day 28
- Added `GET /api/documents` — protected, filters strictly by `req.user.id` (no unauthenticated fallback, since the route requires JWT via `router.use(protect)`)
- Skipped a separate `documentApi.js` file again, matching Day 27's convention — `getDocumentsThunk` calls the shared `api` instance directly inside `documentSlice.js`
- Added `selectedDocumentId` state and `selectDocument`/`clearSelectedDocument` reducers
- Added `DocumentList.jsx`, updated `Documents.jsx` to show it alongside the upload form
- Found and diagnosed a real issue while testing: an early GET request returned an empty array — traced it to querying with a JWT from a different user account than the one that owned the existing uploaded documents, since `GET /api/documents` correctly filters by `userId`. Re-tested consistently under one account afterward
- Also surfaced two genuine past upload failures (`status: "failed"`, `errorMessage: "fetch failed"`) sitting in MongoDB from earlier testing — confirmed this is Day 26's error-handling working as designed (recording failure state rather than losing it), most likely caused by Qdrant not running at the time of those attempts
- Verified: documents persist across a page refresh (proving the real GET flow, not local state), and selecting between multiple documents correctly updates `selectedDocumentId` each time
- Did not touch the Supervisor or chat request shape today — confirmed as Day 29 (thread documentId into chat) and Day 30 (Supervisor routing) per the plan's explicit sequence

### Day 29
- Threaded `documentId` from a chat request into graph state — required changes in only 3 backend files (`chatController.js`, `aiService.js`, `graph.js`), since `state.js`, `documentNode.js`, and `documentAgent.js` already had the necessary fields/logic from Day 24/25 but never actually received a value
- The real gap was a single missing key in `graph.js`'s `runGraph()` — `documentId` was never included in the object passed to `graph.invoke()`, despite `state.js` already defining the field
- Updated `chatSlice.js`'s `sendMessage` thunk and `Chat.jsx` to read `selectedDocumentId` from Redux and include it in the request body
- Note: while reconstructing `chatController.js` for today's edit, found that a locally-held reference copy of the file predated Day 25's `{ text, sources }` changes — reconstructed the file combining Day 25's existing changes with today's `documentId` addition rather than risk silently reverting Day 25's work
- **Not fully verified end-to-end today** — the full Postman/browser test chain (Section 7 of the plan) was skipped; the actual data flow through `graph.invoke()` should be confirmed before relying on it in Day 30
- **Still expected, per the plan:** even with documentId threading complete, the Supervisor still doesn't route document questions to the Document Agent — that remains Day 30's task

### Day 30
- Added document-aware routing to `supervisorNode.js`: if `state.documentId` is present, route directly to the Document Agent, bypassing the Supervisor LLM's decision entirely — the application already has certain knowledge of intent once a document is explicitly selected
- Confirmed no changes were needed to `router.js`, `documentAgent.js`, `documentNode.js`, or `retrieveDocuments.js` — all were already correctly wired for `documentId` since Day 24/25/29; today's gap was purely at the routing-decision level
- Verified all three cases: no document → normal LLM-based routing (coding/research), document selected + relevant question → direct routing to Document Agent with correct retrieval, document-relevant question with no document selected → falls back to normal routing (regression confirmed intact)
- **This closes the routing gap first found on Day 25** — a real chat message with a selected document now reliably reaches the Document Agent, rather than depending on the Supervisor LLM to infer document-relatedness from phrasing alone

### Day 31
- Debugged a real, multi-hour issue: after selecting a document and asking a question, answers kept coming from the Research Agent instead of the Document Agent — despite Day 29/30's `documentId` threading and Supervisor short-circuit both being correct
- Root cause traced to a missing feature, not a bug: no in-app navigation existed between `/documents` and `/chat` (flagged back on Day 27 but never fixed), so switching pages meant typing the URL directly — which triggers a full browser reload and wipes Redux's in-memory `selectedDocumentId` back to `null`. Every backend piece (routing, retrieval, sources) had been correct the entire time
- Added `<Link>` navigation between `Documents.jsx` and `Chat.jsx` (React Router client-side navigation, which does not reload the page or clear Redux state) — closes the Day 27 gap
- Verified end-to-end with a real document: question correctly routed to the Document Agent, retrieval returned accurate content, and — Day 31's actual original goal — sources now render under the assistant's answer in the UI
- Added `DocumentSources.jsx`, wired into `Chat.jsx`'s message list (renders under each assistant message using the `sources` field already returned by the backend since Day 25)
- De-duplicated repeated source lines in `DocumentSources.jsx` (multiple retrieved chunks often share the same file/page) — same fix already applied to the backend's plain-text footer in `documentAgent.js` back on Day 25, now applied consistently on the frontend
- Removed a temporary debug `console.log` from `Chat.jsx` before committing
- **This closes the loop that started with the Day 25 routing gap and the Day 27 "no navigation link exists yet" note** — document Q&A with citations now works reliably through the real UI, not just via Postman