import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadDocumentThunk } from "../redux/documentSlice";

const MAX_SIZE = 10 * 1024 * 1024; // same limit as the backend (10 MB)

const DocumentUpload = () => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState(null);

  const { uploadStatus, uploadError } = useSelector((state) => state.documents);
  const uploading = uploadStatus === "loading";

  function handleFile(file) {
    if (!file) return;
    setLocalError(null);

    if (file.type !== "application/pdf") {
      setLocalError("Please choose a PDF file.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setLocalError("This file is larger than 10 MB.");
      return;
    }
    dispatch(uploadDocumentThunk(file));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (!uploading) handleFile(e.dataTransfer.files[0]);
  }

  function openPicker() {
    if (!uploading) inputRef.current?.click();
  }

  const errorText = localError || (uploadStatus === "failed" ? uploadError : null);

  return (
    <section>
      <div
        className={`dropzone ${dragOver ? "dragover" : ""} ${uploading ? "busy" : ""}`}
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="dropzone-icon">📄</div>
        <p className="dropzone-title">{uploading ? "Uploading…" : "Drop a PDF here"}</p>
        <p className="muted">
          {uploading ? "Please wait a moment" : "or click to choose a file · PDF up to 10 MB"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            handleFile(e.target.files[0]);
            e.target.value = ""; // lets you pick the same file again
          }}
        />
      </div>
      {errorText && <p className="form-error">{errorText}</p>}
    </section>
  );
};

export default DocumentUpload;