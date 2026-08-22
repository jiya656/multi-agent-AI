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