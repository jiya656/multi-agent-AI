// DocumentSources.jsx
// Day 31: renders the sources array that's already attached to each
// assistant message (Message.sources, from Day 25's backend work).
// No Redux changes needed — sources arrive already nested inside each
// message object, not as a separate global piece of state.

const DocumentSources = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div style={{ marginTop: 6, fontSize: 13, color: "#555" }}>
      <strong>Sources</strong>
      {sources.map((source, index) => (
        <p key={index} style={{ margin: "2px 0" }}>
          📄 {source.fileName || "Document"}
          {source.pageNumber ? ` — Page ${source.pageNumber}` : ""}
        </p>
      ))}
    </div>
  );
};

export default DocumentSources;