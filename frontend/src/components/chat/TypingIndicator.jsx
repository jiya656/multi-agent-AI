export default function TypingIndicator({ label = "MultiAI is thinking" }) {
  return (
    <div className="message message-ai">
      <div className="message-meta">
        <span className="message-author">✦ MultiAI</span>
      </div>
      <div className="typing">
        <span>{label}</span>
        <span className="dots"><i /><i /><i /></span>
      </div>
    </div>
  );
}