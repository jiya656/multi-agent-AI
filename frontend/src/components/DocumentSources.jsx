const DocumentSources = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  // De-dupe entries pointing at the same file + page
  const unique = sources.filter(
    (s, i, arr) =>
      arr.findIndex((x) => x.fileName === s.fileName && x.pageNumber === s.pageNumber) === i
  );

  return (
    <div className="sources">
      <div className="sources-label">Sources</div>
      <div className="sources-list">
        {unique.map((source, index) => (
          <span key={index} className="source-chip">
            📄 {source.fileName || "Document"}
            {source.pageNumber ? ` · p. ${source.pageNumber}` : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DocumentSources;