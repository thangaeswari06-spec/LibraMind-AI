/**
 * LibraMind AI - AI Semantic Search (spec section 10)
 *
 * Real semantic search would embed text with an LLM embedding model and do
 * a vector similarity search (pgvector). Without external API keys, this
 * module implements the same *pipeline* — text -> vector -> similarity ->
 * ranking — using TF-IDF vectors and cosine similarity, which already
 * understands natural-language queries far better than plain keyword LIKE
 * matching (e.g. "beginner-level books to learn cybersecurity" correctly
 * surfaces the Cybersecurity book even though the query never says its title).
 *
 * Swapping in real embeddings later only means replacing `vectorize()`.
 */
const STOPWORDS = new Set([
  "i", "a", "an", "the", "to", "for", "of", "and", "or", "is", "are", "in",
  "on", "with", "need", "want", "learn", "book", "books", "me", "please", "level"
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w));
}

function buildVocabulary(documents) {
  const vocab = new Set();
  documents.forEach((doc) => tokenize(doc).forEach((w) => vocab.add(w)));
  return Array.from(vocab);
}

function termFrequency(tokens) {
  const tf = {};
  tokens.forEach((t) => (tf[t] = (tf[t] || 0) + 1));
  const total = tokens.length || 1;
  Object.keys(tf).forEach((k) => (tf[k] /= total));
  return tf;
}

function inverseDocFrequency(vocab, tokenizedDocs) {
  const idf = {};
  vocab.forEach((term) => {
    const containing = tokenizedDocs.filter((doc) => doc.includes(term)).length;
    idf[term] = Math.log((1 + tokenizedDocs.length) / (1 + containing)) + 1;
  });
  return idf;
}

function vectorize(tokens, vocab, idf) {
  const tf = termFrequency(tokens);
  return vocab.map((term) => (tf[term] || 0) * idf[term]);
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * @param {string} query - natural language query
 * @param {Array<{id:number,title:string,description:string,tags:string}>} books
 */
function semanticSearch(query, books) {
  const corpusTexts = books.map((b) => `${b.title} ${b.description} ${b.tags}`);
  const tokenizedDocs = corpusTexts.map(tokenize);
  const vocab = buildVocabulary(corpusTexts);
  const idf = inverseDocFrequency(vocab, tokenizedDocs);

  const queryVector = vectorize(tokenize(query), vocab, idf);

  const ranked = books
    .map((book, i) => {
      const docVector = vectorize(tokenizedDocs[i], vocab, idf);
      return { ...book, relevance: Number(cosineSimilarity(queryVector, docVector).toFixed(4)) };
    })
    .filter((b) => b.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance);

  return ranked;
}

module.exports = { semanticSearch, tokenize, cosineSimilarity };
