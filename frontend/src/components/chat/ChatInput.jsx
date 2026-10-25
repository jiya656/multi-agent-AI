import { useEffect, useRef } from "react";

export default function ChatInput({ value, onChange, onSend, sending, selectedDoc, onClearDoc }) {
  const ref = useRef(null);

  // Shrink the box back after sending
  useEffect(() => {
    if (value === "" && ref.current) ref.current.style.height = "auto";
  }, [value]);

  function handleChange(e) {
    onChange(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="input-wrap">
      <div className="input-box">
        {selectedDoc && (
          <div className="doc-chip">
            <div>
              <span className="doc-chip-name">📄 {selectedDoc.fileName}</span>{" "}
              <span className="doc-chip-ok">✓ Ready</span>
              <div className="muted">Using this document for answers</div>
            </div>
            <button onClick={onClearDoc} title="Stop using this document">×</button>
          </div>
        )}
        <div className="input-row">
          <textarea
            ref={ref}
            rows={1}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything…"
            disabled={sending}
          />
          <button
            className="send-btn"
            onClick={onSend}
            disabled={sending || !value.trim()}
            title="Send"
          >
            ➤
          </button>
        </div>
      </div>
      <p className="muted input-hint">Enter to send · Shift + Enter for a new line</p>
    </div>
  );
}