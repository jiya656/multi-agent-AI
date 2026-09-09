// embeddingModel.js
// Day 20: local, free, open-source embedding model — no API key required.
// NOTE: originally planned to use @langchain/community's HuggingFace
// wrapper, but that package was officially sunset (archived May 2026)
// with no maintained JS replacement yet. This calls Hugging Face's own
// Transformers.js package directly instead — the actively-maintained
// library the LangChain wrapper was just wrapping anyway.
//
// The model downloads once on first use (~90MB, cached locally after
// that) and runs entirely on your machine — no API key, no per-call cost.

const { pipeline } = require("@huggingface/transformers");

let extractorPromise;

const getExtractor = () => {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractorPromise;
};

const embedDocuments = async (texts) => {
  const extractor = await getExtractor();
  const output = await extractor(texts, { pooling: "mean", normalize: true });
  return output.tolist();
};

const embedQuery = async (text) => {
  const [vector] = await embedDocuments([text]);
  return vector;
};

module.exports = { embedDocuments, embedQuery };