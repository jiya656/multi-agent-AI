// pdfLoader.js
// Day 21: extracts text from a PDF file into LangChain Document objects
// (pageContent + metadata like page number and source), so downstream
// chunking/embedding steps have both the text and where it came from.

const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");

const loadPDF = async (filePath) => {
  const loader = new PDFLoader(filePath);
  const documents = await loader.load();
  return documents;
};

module.exports = loadPDF;