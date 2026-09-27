import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDocumentsThunk, selectDocument } from "../redux/documentSlice";

const DocumentList = () => {
  const dispatch = useDispatch();

  const { documents, selectedDocumentId, fetchStatus, fetchError } = useSelector(
    (state) => state.documents
  );

  useEffect(() => {
    dispatch(getDocumentsThunk());
  }, [dispatch]);

  // Day 37: poll while any document is still processing. This effect
  // re-runs every time `documents` changes (a new fetch replaces the
  // array reference), so it naturally re-checks after each poll and
  // simply stops scheduling a new timer once nothing is "processing"
  // anymore — no separate manual stop condition needed.
  useEffect(() => {
    const hasProcessing = documents.some((doc) => doc.status === "processing");
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      dispatch(getDocumentsThunk());
    }, 2000);

    return () => clearInterval(interval);
  }, [documents, dispatch]);

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