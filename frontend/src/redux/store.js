// store.js
//
// The central Redux store. configureStore (Redux Toolkit) sets up
// sensible defaults for us (including Redux DevTools support) — the
// plain-Redux version of this took much more boilerplate.

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Day 5+: chat: chatReducer, documents: documentReducer, etc.
  },
});