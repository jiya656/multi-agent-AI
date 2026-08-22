// chatSlice.js
//
// Same pattern as authSlice.js: createAsyncThunk for each API call,
// extraReducers to handle pending/fulfilled/rejected for each one.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchChats = createAsyncThunk("chat/fetchChats", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/chats");
    return res.data.chats;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to load chats");
  }
});

export const createChat = createAsyncThunk("chat/createChat", async (_, { rejectWithValue }) => {
  try {
    const res = await api.post("/chats");
    return res.data.chat;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to create chat");
  }
});

// Fetches ONE conversation plus its full message history — used when the
// user clicks a chat in the sidebar.
export const fetchChat = createAsyncThunk("chat/fetchChat", async (chatId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/chats/${chatId}`);
    return res.data; // { chat, messages }
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to load chat");
  }
});

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ chatId, content }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/chats/${chatId}/messages`, { content });
      return res.data.data; // the saved message
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to send message");
    }
  }
);

export const deleteChat = createAsyncThunk("chat/deleteChat", async (chatId, { rejectWithValue }) => {
  try {
    await api.delete(`/chats/${chatId}`);
    return chatId; // just need the id back, to remove it from state
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to delete chat");
  }
});

const initialState = {
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearCurrentChat(state) {
      state.currentChat = null;
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- fetchChats ----
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ---- createChat ----
      .addCase(createChat.fulfilled, (state, action) => {
        // Add the new chat to the TOP of the list — it's the most recent.
        state.chats.unshift(action.payload);
        state.currentChat = action.payload;
        state.messages = [];
      })
      .addCase(createChat.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ---- fetchChat ----
      .addCase(fetchChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChat.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat = action.payload.chat;
        state.messages = action.payload.messages;
      })
      .addCase(fetchChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ---- sendMessage ----
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Append the confirmed-saved message to the current conversation's
        // message list, so it shows up in the chat window immediately.
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ---- deleteChat ----
      .addCase(deleteChat.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.chats = state.chats.filter((c) => c._id !== deletedId);
        // If the chat we just deleted was open, clear it out of view.
        if (state.currentChat?._id === deletedId) {
          state.currentChat = null;
          state.messages = [];
        }
      })
      .addCase(deleteChat.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCurrentChat } = chatSlice.actions;
export default chatSlice.reducer;