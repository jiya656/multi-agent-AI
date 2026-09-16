import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadDocumentThunk } from "../redux/documentSlice";

const DocumentUpload = () => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);

  const { uploadStatus, uploadError } = useSelector((state) => state.documents);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a PDF first.");
      return;
    }
    dispatch(uploadDocumentThunk(file));
  };

  return (
    <div>
      <h2>Upload Document</h2>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      {file && <p>Selected: {file.name}</p>}

      <button onClick={handleUpload} disabled={uploadStatus === "loading"}>
        {uploadStatus === "loading" ? "Processing..." : "Upload Document"}
      </button>

      {uploadStatus === "succeeded" && <p>Document uploaded successfully.</p>}
      {uploadStatus === "failed" && <p>Error: {uploadError}</p>}
    </div>
  );
};

export default DocumentUpload;