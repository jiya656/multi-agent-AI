// formatContext.js
// Day 25: turns retrieved chunks into a clean, labeled block of text for
// the LLM prompt. Metadata comes from LangChain's PDFLoader/text splitter,
// shaped like { source: "./test-data/File.pdf", loc: { pageNumber } }.

const path = require("path");

const formatContext = (documents) => {
  return documents
    .map((doc, index) => {
      const fileName = doc.metadata?.source
        ? path.basename(doc.metadata.source)
        : "Unknown document";

      const page = doc.metadata?.loc?.pageNumber
        ? `Page ${doc.metadata.loc.pageNumber}`
        : "";

      return `
Source ${index + 1}
Document: ${fileName}
${page}

Content:
${doc.text}
`;
    })
    .join("\n-------------------\n");
};

module.exports = formatContext;