export default function DocumentStatus({ status }) {
  if (status === "processing") {
    return (
      <div className="doc-status">
        <span className="badge badge-warning">
          <span className="spinner" /> Processing…
        </span>
        <div className="progress"><div className="progress-bar" /></div>
      </div>
    );
  }
  if (status === "completed") return <span className="badge badge-success">✓ Ready</span>;
  if (status === "failed") return <span className="badge badge-error">⚠ Processing failed</span>;
  return null;
}