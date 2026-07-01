const express = require("express");
const cors = require("cors");


const requestLogger = require("./middleware/requestLogger");

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);

const notifications = [
  {
    id: 1,
    title: "Exam schedule updated",
    message: "Midterm timetable is now live.",
    type: "result",
    isPinned: true,
    isUnread: true,
    isUrgent: true,
    createdAt: "2026-07-01T09:00:00Z",
  },
  {
    id: 2,
    title: "New assignment posted",
    message: "Assignment 3 has been published.",
    type: "placement",
    isPinned: false,
    isUnread: true,
    isUrgent: false,
    createdAt: "2026-07-01T08:30:00Z",
  },
  {
    id: 3,
    title: "Campus event reminder",
    message: "Annual day registration closes today.",
    type: "event",
    isPinned: false,
    isUnread: false,
    isUrgent: false,
    createdAt: "2026-06-30T18:00:00Z",
  },
  {
    id: 4,
    title: "Fee payment due",
    message: "Pay before the deadline to avoid late fees.",
    type: "event",
    isPinned: true,
    isUnread: false,
    isUrgent: true,
    createdAt: "2026-06-30T10:00:00Z",
  },
  {
    id: 5,
    title: "Library notice",
    message: "Books due for return tomorrow.",
    type: "placement",
    isPinned: false,
    isUnread: true,
    isUrgent: true,
    createdAt: "2026-07-01T10:15:00Z",
  },
];


function getPriorityScore(notification) {
  let score = 0;

  if (notification.isPinned) score += 100;
  if (notification.isUrgent) score += 50;
  if (notification.isUnread) score += 20;

  // Newer items get a small boost, which helps break ties naturally.
  const ageHours =
    (Date.now() - new Date(notification.createdAt).getTime()) /
    (1000 * 60 * 60);

  score += Math.max(0, 24 - ageHours);
  return score;
}

function getPriorityLabel(score) {
  
  if (score >= 120) return "high";
  if (score >= 70) return "medium";
  return "low";
}

function normalizeQuery(value) {
  return String(value || "all").toLowerCase();
}

function getNotifications(req, res) {
  const type = normalizeQuery(req.query.type);
  const priority = normalizeQuery(req.query.priority);
  const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);

  // Filtering first reduces sorting work on large lists.
  const filtered = notifications.filter((n) => {
    const score = getPriorityScore(n);
    const priorityLabel = getPriorityLabel(score);

    const typeOk = type === "all" || n.type === type;
    const priorityOk = priority === "all" || priorityLabel === priority;

    return typeOk && priorityOk;
  });

  
  const prioritized = filtered
    .map((n) => ({
      ...n,
      priorityScore: getPriorityScore(n),
      priorityLabel: getPriorityLabel(getPriorityScore(n)),
    }))
    .sort(
      (a, b) =>
        b.priorityScore - a.priorityScore ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);

  res.json({
    count: prioritized.length,
    notifications: prioritized,
  });
}


app.get("/notifications", getNotifications);
app.get("/notifications/priority", getNotifications);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});