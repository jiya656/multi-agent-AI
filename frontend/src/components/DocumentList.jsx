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

  if (fetchStatus === "loading") return <p>Loading documents...</p>;
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
            <p>Status: {document.status}</p>
            <button onClick={() => dispatch(selectDocument(document._id))}>
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