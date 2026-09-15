/**
 * Task 8: Background job — simulates checking for due-soon books and
 * enqueuing notifications. In production this would run on a schedule
 * (e.g. node-cron) or via a real queue (BullMQ/Redis).
 */
const borrowings = [
  { student: "Ananya", book: "Python Programming", dueDate: "2026-09-12" },
  { student: "Karthik", book: "Data Structures", dueDate: "2026-09-20" }
];

function checkDueSoonAndNotify() {
  const today = new Date();
  borrowings.forEach((b) => {
    const due = new Date(b.dueDate);
    const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 2 && daysLeft >= 0) {
      console.log(`🔔 Notification: "${b.book}" is due in ${daysLeft} day(s) for ${b.student}.`);
    }
  });
}

function startNotificationJob(intervalMs = 60000) {
  console.log("Background notification job started.");
  checkDueSoonAndNotify(); // run once immediately
  return setInterval(checkDueSoonAndNotify, intervalMs);
}

module.exports = { startNotificationJob, checkDueSoonAndNotify };
