// documentSlice.js
// Day 28: added getDocumentsThunk (inline api call, matching chatSlice.js's
// style — no separate service file) and document selection state.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const uploadDocumentThunk = createAsyncThunk(
  "documents/upload",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/documents/upload", formData);
      return res.data.document;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.response?.data?.message || "Document upload failed"
      );
    }
  }
);

export const getDocumentsThunk = createAsyncThunk(
  "documents/getDocuments",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/documents");
      return res.data.documents;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.response?.data?.message || "Failed to fetch documents"
      );
    }
  }
);

const initialState = {
  documents: [],
  selectedDocumentId: null,
  uploadStatus: "idle",
  uploadError: null,
  fetchStatus: "idle",
  fetchError: null,
};

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    selectDocument: (state, action) => {
      state.selectedDocumentId = action.payload;
    },
    clearSelectedDocument: (state) => {
      state.selectedDocumentId = null;
    },
  },
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
      })
      .addCase(getDocumentsThunk.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(getDocumentsThunk.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.documents = action.payload;
      })
      .addCase(getDocumentsThunk.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload;
      });
  },
});

export const { selectDocument, clearSelectedDocument } = documentSlice.actions;
export default documentSlice.reducer;