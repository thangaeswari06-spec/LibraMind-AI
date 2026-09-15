/**
 * LibraMind AI - AI Book Recommendation Engine (spec section 9)
 * Scores books against a student's interests, learning level, and detected
 * weak topics (from quiz-generator's analyzeQuizPerformance).
 */
function generateRecommendations({ books, interests = [], learningLevel = "beginner", weakTopics = [] }) {
  const scored = books.map((book) => {
    const tags = (book.tags || "").toLowerCase().split(",");
    let score = 0;

    interests.forEach((interest) => {
      if (tags.includes(interest.toLowerCase())) score += 3;
    });
    weakTopics.forEach((topic) => {
      if (tags.includes(topic.toLowerCase())) score += 5; // prioritize remediation
    });
    if (tags.includes(learningLevel)) score += 1;

    return { ...book, score };
  });

  return scored
    .filter((b) => b.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

module.exports = { generateRecommendations };
