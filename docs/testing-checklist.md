# Testing Checklist

Status reflects what has actually been run against the live application
during this build (Days 30–43), not just code review. Each checked item
links back to when it was genuinely verified.

## Authentication
- [x] Register user — pre-existing, confirmed Day 39 review
- [x] Duplicate email → 409 — `authController.js`, confirmed Day 39 review
- [x] Invalid email / short password → 400 — zod validation, Day 42
- [x] Login — pre-existing, used continuously since Day 32
- [x] Invalid password → 401 (generic message, doesn't leak which field was wrong)
- [x] Missing JWT → 401 — confirmed repeatedly, most recently Day 42 Test 2
- [x] Invalid JWT → 401 — `authMiddleware.js`'s `jwt.verify` catch

## Conversations
- [x] Create / Get / Delete — pre-existing, confirmed Day 40 review
- [x] User isolation — confirmed with a **real second account**, Day 42 Test 5 (404, not 403, by design)

## Chat
- [x] Normal chat — used continuously since Day 32
- [x] Conversation memory — Day 33, three real scenarios (name recall, follow-up resolution, document+memory combined)
- [x] Coding / Research / Document agent routing — confirmed throughout; Document Agent routing specifically re-confirmed Day 32 via `[supervisorNode] document selected` logs

## RAG
- [x] Upload PDF → processing → completed — Day 36/37/38
- [x] Embeddings stored in Qdrant — confirmed via `points_count` check, Day 32
- [x] Retrieval + scores — Day 32 diagnostic script, real chunk text inspected directly
- [x] Document filtering (multi-document isolation) — Day 32 Test 3
- [x] Sources returned — Day 31

## Redis
- [x] Cache miss → hit — Day 34, including the false-alarm debugging story (confirmed real hit/miss via logs, not assumed)
- [x] Rate limiting (429 at request 21+) — confirmed Day 43, after being an open gap since Day 35. Script output: clean 200s (with expected 502 noise from the real LLM provider under rapid load) through request 20, then 429 on 21 and 22
- [ ] Rate limiter's response body format — uses `{ "message": ... }`, not the `{ "error": ... }` key the rest of the API standardized on during Day 42's migration. Not yet fixed.

## Background Jobs
- [x] Queue → worker processing — Day 36
- [x] Retry on failure — incidentally confirmed via a real bug (missing MongoDB connection in the worker process caused 3 genuine retry attempts matching the configured `attempts: 3`)

## Realtime
- [x] Socket connection — Day 38, confirmed via `Client connected` logs
- [x] Status push (processing → completed) — Day 38, full chain confirmed: worker → Redis publish → backend subscriber log → live UI update
- [ ] `failed` status event — never actually triggered and observed end-to-end; the worker code path exists but hasn't been tested with a real failing document

## Error Handling
- [x] 400 (validation, invalid ID) — Day 42, including a real bug fix (malformed ID used to return 500, now correctly 400)
- [x] 401 (missing/invalid JWT) — confirmed repeatedly
- [x] 404 (not found, cross-user isolation) — Day 42 Test 4 and Test 5
- [x] 409 (duplicate email) — pre-existing, confirmed Day 39 review
- [x] 429 (rate limit) — confirmed Day 43
- [x] 502 (AI provider failure) — Day 42 Test 6, real invalid API key
- [ ] 503 — not applicable; nothing in the codebase deliberately returns 503 (502 is what this project actually uses for upstream AI failures)

## Known open items from this review
1. Rate limiter's response format doesn't match the rest of the API (`message` vs `error`) — small fix, not done today
2. `failed` Socket.IO event path has never been exercised with a real failure — would need a deliberately broken PDF or forced ingestion error to verify