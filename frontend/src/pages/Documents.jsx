import { Link } from "react-router-dom";
import DocumentUpload from "../components/DocumentUpload";
import DocumentList from "../components/DocumentList";
import "../styles/documents.css";

const Documents = () => {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Documents</h1>
          <p className="muted">Your knowledge base. Upload a PDF, then use it in chat.</p>
        </div>
        <Link to="/chat" className="btn">← Back to chat</Link>
      </header>

      <DocumentUpload />

      <h2 className="section-title">Your documents</h2>
      <DocumentList />
    </div>
  );
};

export default Documents;