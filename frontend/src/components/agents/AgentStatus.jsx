import { useEffect, useState } from "react";

// Shows the phases of an answer while the AI works. The backend returns one
// response, so these phases are ESTIMATED from timing, not real events.
// With a document selected, the supervisor always routes to the document
// agent, so "Searching your document" is accurate for that case.
export default function AgentStatus({ hasDocument }) {
  const steps = hasDocument
    ? ["Analyzing your request", "Searching your document", "Preparing your answer"]
    : ["Analyzing your request", "Preparing your answer"];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => Math.min(c + 1, steps.length - 1));
    }, 1500);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="message message-ai">
      <div className="message-meta">
        <span className="message-author">✦ MultiAI</span>
      </div>
      <ul className="agent-steps">
        {steps.map((label, i) => {
          const state = i < current ? "done" : i === current ? "active" : "todo";
          return (
            <li key={label} className={state}>
              <span className="step-icon">
                {state === "done" && "✓"}
                {state === "active" && (
                  <span className="dots"><i /><i /><i /></span>
                )}
                {state === "todo" && "○"}
              </span>
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}