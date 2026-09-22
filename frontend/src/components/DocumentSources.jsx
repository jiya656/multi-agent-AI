const DocumentSources = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  // De-dupe entries pointing at the same file+page (common when multiple
  // retrieved chunks come from the same page).
  const unique = sources.filter(
    (s, i, arr) =>
      arr.findIndex((x) => x.fileName === s.fileName && x.pageNumber === s.pageNumber) === i
  );

  return (
    <div style={{ marginTop: 6, fontSize: 13, color: "#555" }}>
      <strong>Sources</strong>
      {unique.map((source, index) => (
        <p key={index} style={{ margin: "2px 0" }}>
          📄 {source.fileName || "Document"}
          {source.pageNumber ? ` — Page ${source.pageNumber}` : ""}
        </p>
      ))}
    </div>
  );
};

export default DocumentSources;