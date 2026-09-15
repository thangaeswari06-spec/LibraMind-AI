/**
 * LibraMind AI - AI Book Demand Prediction (spec section 15)
 *
 * Uses simple linear regression over monthly borrow counts to project next
 * month's demand — a legitimate, explainable forecasting technique (the
 * same family of model production systems often start with before moving
 * to a heavier time-series model).
 */

// Ordinary least squares on (x = month index, y = borrow count)
function linearRegression(points) {
  const n = points.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/**
 * @param {number[]} monthlyBorrowCounts - borrow counts per month, oldest first
 * @param {number} currentCopies
 */
function predictDemand(monthlyBorrowCounts, currentCopies) {
  const points = monthlyBorrowCounts.map((y, x) => ({ x, y }));
  const { slope, intercept } = linearRegression(points);

  const nextMonthIndex = monthlyBorrowCounts.length;
  const rawPrediction = slope * nextMonthIndex + intercept;
  const predictedDemand = Math.max(0, Math.round(rawPrediction));

  const suggestedAdditionalCopies = Math.max(0, predictedDemand - currentCopies);

  return {
    monthlyBorrowCounts,
    trend: slope > 0.1 ? "increasing" : slope < -0.1 ? "decreasing" : "stable",
    predictedDemand,
    currentCopies,
    suggestedAdditionalCopies
  };
}

module.exports = { predictDemand, linearRegression };
