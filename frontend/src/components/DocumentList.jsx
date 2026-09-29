import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDocumentsThunk, selectDocument, documentStatusUpdated } from "../redux/documentSlice";
import socket from "../services/socket";

const DocumentList = () => {
  const dispatch = useDispatch();

  const { documents, selectedDocumentId, fetchStatus, fetchError } = useSelector(
    (state) => state.documents
  );

  useEffect(() => {
    dispatch(getDocumentsThunk());
  }, [dispatch]);

  // Day 38: replaces Day 37's polling. Status now arrives by push.
  // On (re)connect we refetch once, since events fired while the socket
  // was disconnected are lost — REST stays the source of truth.
  useEffect(() => {
    const handleStatus = (data) => dispatch(documentStatusUpdated(data));
    const handleConnect = () => dispatch(getDocumentsThunk());

    socket.on("document:status", handleStatus);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("document:status", handleStatus);
      socket.off("connect", handleConnect);
    };
  }, [dispatch]);
  if (fetchStatus === "loading" && documents.length === 0) return <p>Loading documents...</p>;
  if (fetchStatus === "failed") return <p>Error: {fetchError}</p>;

  return (
    <div>
      <h2>My Documents</h2>

      {documents.length === 0 && <p>No documents uploaded yet.</p>}

      {documents.map((document) => {
        const isSelected = document._id === selectedDocumentId;

        return (
          <div key={document._id}>
            <p>📄 {document.fileName}</p>
            <p>
              {document.status === "processing" && "⏳ Processing..."}
              {document.status === "completed" && "✅ Ready"}
              {document.status === "failed" && "❌ Processing failed"}
            </p>
            <button onClick={() => dispatch(selectDocument(document._id))} disabled={document.status !== "completed"}>
              {isSelected ? "Selected" : "Select"}
            </button>
          </div>
        );
      })}

      {selectedDocumentId && <p>Selected document ID: {selectedDocumentId}</p>}
    </div>
  );
};

export default DocumentList;