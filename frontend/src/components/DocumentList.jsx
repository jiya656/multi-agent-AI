import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getDocumentsThunk, selectDocument, documentStatusUpdated } from "../redux/documentSlice";
import socket from "../services/socket";
import DocumentStatus from "./DocumentStatus";

function formatDate(value) {
  if (!value) return "just now";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const DocumentList = () => {
  const dispatch = useDispatch();

  const { documents, selectedDocumentId, fetchStatus } = useSelector(
    (state) => state.documents
  );

  useEffect(() => {
    dispatch(getDocumentsThunk());
  }, [dispatch]);

  // Status updates arrive by push (Socket.IO). On (re)connect we refetch once,
  // because events fired while the socket was disconnected are lost.
  useEffect(() => {
    const handleStatus = (data) => dispatch(documentStatusUpdated(data));
    const handleConnect = () => dispatch(getDocumentsThunk());

    socket.on("document:status", handleStatus);
    socket.on("connect", handleConnect);
    socket.connect(); // no-op if already connected

    return () => {
      socket.off("document:status", handleStatus);
      socket.off("connect", handleConnect);
      socket.disconnect(); // leaving the page (or logging out) ends the session
    };
  }, [dispatch]);

  if (fetchStatus === "loading" && documents.length === 0) {
    return <p className="muted">Loading your documents…</p>;
  }
  if (fetchStatus === "failed") {
    return (
      <div className="docs-error">
        <strong>We couldn't load your documents</strong>
        <p className="muted">Please refresh the page and try again.</p>
      </div>
    );
  }
  if (documents.length === 0) {
    return (
      <div className="empty-docs">
        <p><strong>No documents yet</strong></p>
        <p className="muted">Upload a PDF above and it will appear here.</p>
      </div>
    );
  }

  // Newest first. A just-uploaded document has no createdAt yet, so it counts as "now".
  const sorted = [...documents].sort(
    (a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now())
  );
  const selectedDoc = documents.find((d) => d._id === selectedDocumentId);

  return (
    <div className="docs-list">
      {sorted.map((document) => {
        const isSelected = document._id === selectedDocumentId;

        return (
          <div key={document._id} className={`doc-card ${isSelected ? "selected" : ""}`}>
            <div className="doc-card-main">
              <div className="doc-card-name">📄 {document.fileName}</div>
              <div className="muted">Uploaded {formatDate(document.createdAt)}</div>
              {document.status === "failed" && (
                <div className="muted">
                  We couldn't read this file. Please upload it again.
                </div>
              )}
            </div>

            <div className="doc-card-side">
              <DocumentStatus status={document.status} />
              <button
                className={`btn ${isSelected ? "btn-primary" : ""}`}
                onClick={() => dispatch(selectDocument(document._id))}
                disabled={document.status !== "completed"}
              >
                {isSelected ? "Selected ✓" : "Select"}
              </button>
            </div>
          </div>
        );
      })}

      {selectedDoc && (
        <div className="select-bar">
          <span>
            Using <strong>{selectedDoc.fileName}</strong> for answers
          </span>
          <Link to="/chat" className="btn btn-primary">
            Chat with this document →
          </Link>
        </div>
      )}
    </div>
  );
};

export default DocumentList;