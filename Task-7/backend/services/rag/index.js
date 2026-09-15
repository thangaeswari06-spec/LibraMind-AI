/**
 * LibraMind AI - RAG-Based Book Assistant (spec section 11, "Book Q&A")
 *
 * Full RAG = chunk text -> embed chunks -> vector search -> feed the top
 * chunk(s) to an LLM as context -> generate an answer. This module
 * implements the retrieval half for real (chunking + TF-IDF/cosine
 * retrieval, reusing the semantic-search engine) and the generation half as
 * an extractive answer (the most relevant chunk, presented as the answer).
 * Swap `generateAnswer()`'s body for an LLM call — passing it the same
 * `retrievedChunk` as context — to go from extractive to fully generative.
 */
const { tokenize, cosineSimilarity } = require("../semantic-search");

function chunkText(text, sentencesPerChunk = 2) {
  const sentences = text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).filter(Boolean);
  const chunks = [];
  for (let i = 0; i < sentences.length; i += sentencesPerChunk) {
    chunks.push(sentences.slice(i, i + sentencesPerChunk).join(" "));
  }
  return chunks;
}

function vectorizeSimple(tokens, vocab) {
  const counts = {};
  tokens.forEach((t) => (counts[t] = (counts[t] || 0) + 1));
  return vocab.map((term) => counts[term] || 0);
}

function retrieveRelevantChunk(question, bookContent) {
  const chunks = chunkText(bookContent);
  const vocabSet = new Set(tokenize(question));
  chunks.forEach((c) => tokenize(c).forEach((w) => vocabSet.add(w)));
  const vocab = Array.from(vocabSet);

  const qVector = vectorizeSimple(tokenize(question), vocab);
  let best = { chunk: chunks[0] || "", score: -1, index: 0 };

  chunks.forEach((chunk, index) => {
    const cVector = vectorizeSimple(tokenize(chunk), vocab);
    const score = cosineSimilarity(qVector, cVector);
    if (score > best.score) best = { chunk, score, index };
  });

  return best;
}

/**
 * @param {string} question - e.g. "Explain TCP and UDP from this chapter."
 * @param {string} bookContent - the selected book/chapter's full text
 */
function askBook(question, bookContent) {
  const { chunk, score } = retrieveRelevantChunk(question, bookContent);

  if (score <= 0) {
    return {
      answer: "I couldn't find content in this book that answers that question. Try rephrasing, or ask about a topic covered in the book.",
      sourceChunk: null,
      confidence: 0
    };
  }

  return {
    answer: chunk,
    sourceChunk: chunk,
    confidence: Number(score.toFixed(3))
  };
}

module.exports = { askBook, chunkText, retrieveRelevantChunk };
