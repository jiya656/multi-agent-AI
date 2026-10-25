import { useState } from "react";
import ReactMarkdown from "react-markdown";
import DocumentSources from "../DocumentSources";

const AGENT_LABELS = {
  coding: "Coding Agent",
  research: "Research Agent",
  document: "Document Agent",
};

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard not available: ignore
    }
  }

  return (
    <div className={`message ${isUser ? "message-user" : "message-ai"}`}>
      <div className="message-meta">
        <span className="message-author">{isUser ? "You" : "✦ MultiAI"}</span>
        {!isUser && AGENT_LABELS[message.agent] && (
          <span className="agent-tag">{AGENT_LABELS[message.agent]}</span>
        )}
        {time && <span className="muted">{time}</span>}
      </div>

      {isUser ? (
        <p className="message-text">{message.content}</p>
      ) : (
        <div className="markdown">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      )}

      {!isUser && (
        <div className="message-actions">
          <button className="btn-ghost" onClick={handleCopy}>
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
      )}
      {!isUser && <DocumentSources sources={message.sources} />}
    </div>
  );
}