// Task 2: Temporary in-memory storage (replaced by a real DB in Task 6)
const users = [];

function addUser(user) {
  users.push({ ...user, id: users.length + 1, createdAt: new Date().toISOString() });
}

function findUserByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

module.exports = { users, addUser, findUserByEmail };
