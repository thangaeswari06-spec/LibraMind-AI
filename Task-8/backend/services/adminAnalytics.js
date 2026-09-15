/**
 * LibraMind AI - Admin Analytics Dashboard (spec section 19)
 * Aggregates student, book, transaction, finance, and AI-usage stats.
 * In the merged final app this would query Task-6's real tables; here it
 * demonstrates the aggregation logic against representative sample data so
 * Task 8 stays independently runnable (per this project's own convention).
 */
function buildAdminAnalytics({ students = [], books = [], borrowings = [], fines = [], searches = [] }) {
  const studentAnalytics = {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.active).length,
    departmentBreakdown: students.reduce((acc, s) => {
      acc[s.department] = (acc[s.department] || 0) + 1;
      return acc;
    }, {})
  };

  const bookAnalytics = {
    totalBooks: books.length,
    availableBooks: books.reduce((sum, b) => sum + b.availableCopies, 0),
    borrowedBooks: books.reduce((sum, b) => sum + (b.totalCopies - b.availableCopies), 0),
    mostBorrowed: [...books].sort((a, b) => b.borrowCount - a.borrowCount).slice(0, 3).map((b) => b.title),
    leastBorrowed: [...books].sort((a, b) => a.borrowCount - b.borrowCount).slice(0, 3).map((b) => b.title),
    popularCategories: Object.entries(
      books.reduce((acc, b) => {
        acc[b.category] = (acc[b.category] || 0) + b.borrowCount;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).map(([category]) => category)
  };

  const transactionAnalytics = {
    currentBorrowings: borrowings.filter((b) => b.status === "borrowed").length,
    returnedBooks: borrowings.filter((b) => b.status === "returned").length,
    overdueBooks: borrowings.filter((b) => b.status === "overdue").length
  };

  const financeAnalytics = {
    totalFines: fines.reduce((sum, f) => sum + f.amount, 0),
    paidFines: fines.filter((f) => f.isPaid).reduce((sum, f) => sum + f.amount, 0),
    pendingFines: fines.filter((f) => !f.isPaid).reduce((sum, f) => sum + f.amount, 0)
  };

  const aiAnalytics = {
    popularSearches: Object.entries(
      searches.reduce((acc, q) => {
        acc[q] = (acc[q] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([query, count]) => ({ query, count }))
  };

  return { studentAnalytics, bookAnalytics, transactionAnalytics, financeAnalytics, aiAnalytics };
}

module.exports = { buildAdminAnalytics };
