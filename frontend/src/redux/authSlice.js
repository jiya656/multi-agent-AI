// authSlice.js
//
// This slice owns everything related to "who is logged in right now."
// createSlice (Redux Toolkit) generates action creators + a reducer for
// us from this one definition — much less boilerplate than plain Redux.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// createAsyncThunk handles the async request AND automatically dispatches
// pending/fulfilled/rejected actions as it runs — we just write the
// actual API call, and handle the three states below in extraReducers.
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      return res.data;
    } catch (err) {
      // err.response.data is the JSON error body our Express controller sent
      // (e.g. { error: "A user with that email already exists" }).
      return rejectWithValue(err.response?.data?.error || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      // Persist the token so the login survives a page refresh.
      localStorage.setItem("token", res.data.token);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Login failed");
    }
  }
);

// On first load, check if a token already exists from a previous session
// (e.g. the user refreshed the page).
const existingToken = localStorage.getItem("token");

const initialState = {
  user: null,
  token: existingToken || null,
  isAuthenticated: Boolean(existingToken),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem("token");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
  // extraReducers handles the pending/fulfilled/rejected actions that
  // createAsyncThunk auto-generates for registerUser and loginUser.
  extraReducers: (builder) => {
    builder
      // ---- Register ----
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        // Deliberately NOT logging the user in automatically here —
        // matches Day 3's backend, where register returns a message but
        // no token. They still need to go log in.
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ---- Login ----
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;