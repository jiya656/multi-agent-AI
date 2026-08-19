import { useState } from "react";
import "./App.css";

// Day 1 goal: prove React can successfully call our Express backend.
// This is intentionally simple — no Redux, no routing, no styling
// system yet. Just a button and a fetch call.

const BACKEND_URL = "http://localhost:5000";

function App() {
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  async function testBackend() {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/test`);
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setMessage(data.message);
      setStatus("success");
    } catch (err) {
      setMessage("Could not reach the backend. Is it running on port 5000?");
      setStatus("error");
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>Multi-Agent AI Workspace</h1>
      <p style={{ color: "#666" }}>Day 1: Frontend ↔ Backend connection test</p>

      <button
        onClick={testBackend}
        disabled={status === "loading"}
        style={{
          padding: "10px 20px",
          fontSize: 16,
          cursor: "pointer",
          marginTop: 20,
        }}
      >
        {status === "loading" ? "Testing…" : "Test Backend"}
      </button>

      {message && (
        <p
          style={{
            marginTop: 20,
            fontWeight: 600,
            color: status === "success" ? "green" : "crimson",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default App;
