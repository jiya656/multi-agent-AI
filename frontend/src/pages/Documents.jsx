import DocumentUpload from "../components/DocumentUpload";
import DocumentList from "../components/DocumentList";

const Documents = () => {
  return (
    <div>
      <DocumentUpload />
      <hr />
      <DocumentList />
    </div>
  );
};

export default Documents;