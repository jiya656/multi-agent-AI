// api.js
//
// ONE central place that knows the backend's URL and how to attach the
// JWT to outgoing requests. Every page/component imports THIS instead of
// calling axios directly — so when we deploy and localhost:5000 becomes a
// real production URL, we change it in exactly one place.

import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// A request interceptor runs on EVERY outgoing request before it's sent.
// Here, we check if we have a token stored, and if so, attach it as the
// Authorization header automatically — so individual components never
// need to remember to do this themselves.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;