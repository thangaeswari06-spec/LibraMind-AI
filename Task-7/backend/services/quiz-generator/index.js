/**
 * LibraMind AI - AI Quiz Generator (spec section 12)
 *
 * Generates fill-in-the-blank MCQs from a book's content: pick a key
 * sentence, blank out its most distinctive word, and build 3 distractor
 * options from other distinctive words in the same book (or a fallback
 * pool). Difficulty controls how "guessable" the blanked word is
 * (its rank among the sentence's noteworthy words).
 */
const { splitSentences, extractKeywords } = require("../summarization");

const DIFFICULTY_TO_MIN_WORD_LENGTH = { easy: 4, medium: 6, hard: 8 };

function pickBlankWord(sentence, difficulty) {
  const minLen = DIFFICULTY_TO_MIN_WORD_LENGTH[difficulty] || 6;
  const words = sentence
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= minLen);
  if (words.length === 0) return null;
  // pick the longest candidate word — usually the most content-bearing term
  return words.sort((a, b) => b.length - a.length)[0];
}

function buildOptions(correctWord, keywordPool) {
  const distractors = keywordPool
    .filter((w) => w.toLowerCase() !== correctWord.toLowerCase())
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  while (distractors.length < 3) {
    distractors.push(`option${distractors.length + 1}`);
  }

  const options = [...distractors, correctWord].sort(() => 0.5 - Math.random());
  return { options, correctIndex: options.indexOf(correctWord) };
}

/**
 * @param {string} content - book/chapter text
 * @param {string} topic - label for the generated question (e.g. book title)
 * @param {"easy"|"medium"|"hard"} difficulty
 * @param {number} count - number of questions to generate
 */
function generateQuiz(content, topic, difficulty = "medium", count = 3) {
  const sentences = splitSentences(content).filter((s) => s.split(" ").length > 6);
  const keywordPool = extractKeywords(content, 20);

  const questions = [];
  for (const sentence of sentences) {
    if (questions.length >= count) break;
    const blankWord = pickBlankWord(sentence, difficulty);
    if (!blankWord) continue;

    const questionText = sentence.replace(new RegExp(blankWord, "i"), "_____");
    const { options, correctIndex } = buildOptions(blankWord, keywordPool);

    questions.push({
      id: questions.length + 1,
      topic,
      difficulty,
      type: "MCQ",
      question: questionText,
      options,
      correctIndex
    });
  }

  return questions;
}

/**
 * spec section 12: quiz analysis -> weak topic detection
 * @param {Object} topicScores - e.g. { Python: 90, SQL: 80, Statistics: 45 }
 * @param {number} passThreshold
 */
function analyzeQuizPerformance(topicScores, passThreshold = 60) {
  const weakTopics = Object.entries(topicScores)
    .filter(([, score]) => score < passThreshold)
    .map(([topic, score]) => ({ topic, score }));

  return {
    weakTopics: weakTopics.map((t) => t.topic),
    details: weakTopics,
    overallAverage:
      Object.values(topicScores).reduce((a, b) => a + b, 0) / (Object.keys(topicScores).length || 1)
  };
}

module.exports = { generateQuiz, analyzeQuizPerformance };
