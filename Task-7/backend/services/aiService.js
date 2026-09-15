/**
 * LibraMind AI - Task 7
 * AI Recommendation Engine
 *
 * This is a rule-based stand-in that mirrors the interface an LLM-backed
 * service would expose (see LibraMind_AI_Project_Specification.pdf, section 9).
 * Swap `generateRecommendations` internals for a real call to an LLM/embedding
 * API (OpenAI, Anthropic, etc.) once you have API keys — the calling code
 * (controllers/routes) does not need to change.
 */
const CATALOG = [
  { id: 1, title: "Python Basics", category: "Programming", level: "beginner", tags: ["python", "programming"] },
  { id: 2, title: "Data Structures", category: "Programming", level: "intermediate", tags: ["python", "dsa"] },
  { id: 3, title: "Statistics for Data Science", category: "Mathematics", level: "beginner", tags: ["statistics", "math"] },
  { id: 4, title: "Data Analysis with Pandas", category: "Programming", level: "intermediate", tags: ["python", "data"] },
  { id: 5, title: "Machine Learning Basics", category: "AI", level: "intermediate", tags: ["ml", "python"] },
  { id: 6, title: "Deep Learning Fundamentals", category: "AI", level: "advanced", tags: ["ml", "deep-learning"] }
];

function generateRecommendations({ interests = [], learningLevel = "beginner", weakTopics = [] }) {
  const scored = CATALOG.map((book) => {
    let score = 0;
    interests.forEach((interest) => {
      if (book.tags.includes(interest.toLowerCase())) score += 3;
    });
    weakTopics.forEach((topic) => {
      if (book.tags.includes(topic.toLowerCase())) score += 5; // prioritize weak-topic remediation
    });
    if (book.level === learningLevel) score += 1;
    return { ...book, score };
  });

  return scored
    .filter((b) => b.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function detectWeakTopics(quizResults = {}) {
  // quizResults: { "Python": 90, "SQL": 80, "Statistics": 45 }
  return Object.entries(quizResults)
    .filter(([, score]) => score < 60)
    .map(([topic]) => topic);
}

module.exports = { generateRecommendations, detectWeakTopics };
