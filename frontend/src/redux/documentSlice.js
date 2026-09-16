// documentSlice.js
// Day 27: same pattern as chatSlice.js — createAsyncThunk per API call,
// using the shared `api` instance (which auto-attaches the JWT via its
// request interceptor, so no manual Authorization header needed here).

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const uploadDocumentThunk = createAsyncThunk(
  "documents/upload",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Don't set Content-Type manually — axios/the browser sets the
      // correct multipart boundary automatically when the body is FormData.
      const res = await api.post("/documents/upload", formData);
      return res.data.document;
    } catch (err) {
      // documentController.js returns { message } on 400 and
      // { message, error } on 500 — check both shapes.
      return rejectWithValue(
        err.response?.data?.error || err.response?.data?.message || "Document upload failed"
      );
    }
  }
);

const initialState = {
  documents: [],
  uploadStatus: "idle",
  uploadError: null,
};

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadDocumentThunk.pending, (state) => {
        state.uploadStatus = "loading";
        state.uploadError = null;
      })
      .addCase(uploadDocumentThunk.fulfilled, (state, action) => {
        state.uploadStatus = "succeeded";
        state.documents.push(action.payload);
      })
      .addCase(uploadDocumentThunk.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.uploadError = action.payload;
      });
  },
});

export default documentSlice.reducer;