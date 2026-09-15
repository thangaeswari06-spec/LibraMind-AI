/**
 * LibraMind AI - Personalized Learning Assistant (spec section 13)
 * Builds a customized learning roadmap and adapts it based on quiz weakness.
 */

// A small topic dependency graph mirroring the spec's example roadmap.
const TOPIC_GRAPH = {
  "Python Basics": [],
  "Data Structures": ["Python Basics"],
  "SQL": ["Python Basics"],
  "Statistics": ["Python Basics"],
  "Data Analysis": ["Data Structures", "Statistics", "SQL"],
  "Machine Learning": ["Data Analysis"],
  "Deep Learning": ["Machine Learning"]
};

function topologicalOrder(goal) {
  const visited = new Set();
  const order = [];

  function visit(topic) {
    if (visited.has(topic)) return;
    visited.add(topic);
    (TOPIC_GRAPH[topic] || []).forEach(visit);
    order.push(topic);
  }

  visit(goal);
  return order;
}

/**
 * @param {Object} student - { interests: string[], learningLevel, weakTopics: string[] }
 * @param {string} goal - e.g. "Machine Learning"
 */
function buildRoadmap(student, goal = "Machine Learning") {
  let steps = topologicalOrder(goal).map((topic) => ({
    topic,
    status: "not_started"
  }));

  // Adaptive learning: bump weak topics earlier and flag them
  const weak = new Set((student.weakTopics || []).map((t) => t.toLowerCase()));
  steps = steps
    .map((s) => ({ ...s, isWeakArea: weak.has(s.topic.toLowerCase()) }))
    .sort((a, b) => (b.isWeakArea ? 1 : 0) - (a.isWeakArea ? 1 : 0));

  return { goal, steps };
}

/**
 * Adaptive update — call this after a new quiz result comes in.
 * @param {Object} roadmap - previous roadmap returned by buildRoadmap
 * @param {string} topic - topic just quizzed
 * @param {number} score
 */
function updateRoadmapAfterQuiz(roadmap, topic, score, passThreshold = 60) {
  const isWeak = score < passThreshold;
  const steps = roadmap.steps.map((s) =>
    s.topic.toLowerCase() === topic.toLowerCase()
      ? { ...s, isWeakArea: isWeak, status: isWeak ? "needs_review" : "completed" }
      : s
  );

  if (isWeak) {
    // move the weak topic back near the front so it's revisited sooner
    const idx = steps.findIndex((s) => s.topic.toLowerCase() === topic.toLowerCase());
    if (idx > 0) {
      const [item] = steps.splice(idx, 1);
      steps.unshift(item);
    }
  }

  return { ...roadmap, steps };
}

module.exports = { buildRoadmap, updateRoadmapAfterQuiz, TOPIC_GRAPH };
