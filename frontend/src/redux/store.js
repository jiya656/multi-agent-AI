// store.js
//
// The central Redux store. configureStore (Redux Toolkit) sets up
// sensible defaults for us (including Redux DevTools support) — the
// plain-Redux version of this took much more boilerplate.

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import chatReducer from "./chatSlice"; // Day 5: add the chat slice to the store

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer, // Day 5+: chat: chatReducer, documents: documentReducer, etc.
  },
});