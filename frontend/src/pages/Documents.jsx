import DocumentUpload from "../components/DocumentUpload";
import DocumentList from "../components/DocumentList";
import { Link } from "react-router-dom";

const Documents = () => {
  return (
    <div>
      <DocumentUpload />
      <Link to="/chat">Go to Chat →</Link>
      <hr />
      <DocumentList />
    </div>
  );
};

export default Documents;