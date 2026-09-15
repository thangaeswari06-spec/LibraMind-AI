/**
 * LibraMind AI - AI Book and Chapter Summarization (spec section 11)
 *
 * Real summarization would call an LLM. This module implements an
 * extractive summarizer: sentences are scored by the frequency of their
 * important (non-stopword) words, and the highest-scoring sentences are
 * returned in their original order — a well-established, dependency-free
 * technique (similar in spirit to TextRank) that needs no external API.
 */
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "in", "on", "of", "and", "or",
  "to", "for", "with", "as", "by", "that", "this", "it", "can", "be", "such",
  "into", "their", "its", "so", "which", "using", "used"
]);

function splitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function wordFrequencies(sentences) {
  const freq = {};
  sentences.forEach((s) => {
    s.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .forEach((w) => {
        if (w && !STOPWORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
      });
  });
  return freq;
}

function extractKeywords(text, topN = 8) {
  const sentences = splitSentences(text);
  const freq = wordFrequencies(sentences);
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

/**
 * @param {string} text - full book/chapter content
 * @param {number} sentenceCount - how many sentences to keep in the summary
 */
function summarize(text, sentenceCount = 3) {
  const sentences = splitSentences(text);
  if (sentences.length <= sentenceCount) {
    return { summary: sentences.join(" "), keywords: extractKeywords(text) };
  }

  const freq = wordFrequencies(sentences);
  const scored = sentences.map((sentence, index) => {
    const words = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
    const score = words.reduce((sum, w) => sum + (freq[w] || 0), 0) / (words.length || 1);
    return { sentence, index, score };
  });

  const topSentences = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, sentenceCount)
    .sort((a, b) => a.index - b.index) // restore original reading order
    .map((s) => s.sentence);

  return {
    summary: topSentences.join(" "),
    keywords: extractKeywords(text)
  };
}

module.exports = { summarize, extractKeywords, splitSentences };
