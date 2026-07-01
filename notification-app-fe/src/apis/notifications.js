const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


const notifications = [
  {
    id: 1,
    title: "Exam schedule updated",
    message: "Midterm timetable is now live.",
    isPinned: true,
    isUnread: true,
    isUrgent: true,
    createdAt: "2026-07-01T09:00:00Z",
  },
  {
    id: 2,
    title: "New assignment posted",
    message: "Assignment 3 has been published.",
    isPinned: false,
    isUnread: true,
    isUrgent: false,
    createdAt: "2026-07-01T08:30:00Z",
  },
  {
    id: 3,
    title: "Campus event reminder",
    message: "Annual day registration closes today.",
    isPinned: false,
    isUnread: false,
    isUrgent: false,
    createdAt: "2026-06-30T18:00:00Z",
  },
  {
    id: 4,
    title: "Fee payment due",
    message: "Pay before the deadline to avoid late fees.",
    isPinned: true,
    isUnread: false,
    isUrgent: true,
    createdAt: "2026-06-30T10:00:00Z",
  },
  {
    id: 5,
    title: "Library notice",
    message: "Books due for return tomorrow.",
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

  
  const ageHours =
    (Date.now() - new Date(notification.createdAt).getTime()) / (1000 * 60 * 60);

  score += Math.max(0, 24 - ageHours);

  return score;
}

app.get("/notifications/priority", (req, res) => {
  const limit = Math.max(parseInt(req.query.limit || "5", 10), 1);
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const filter = (req.query.filter || "all").toLowerCase();

  
  let list = [...notifications];
  if (filter === "unread") list = list.filter((n) => n.isUnread);
  if (filter === "read") list = list.filter((n) => !n.isUnread);
  if (filter === "pinned") list = list.filter((n) => n.isPinned);
  if (filter === "urgent") list = list.filter((n) => n.isUrgent);

 
  const prioritized = list
    .map((n) => ({ ...n, priorityScore: getPriorityScore(n) }))
    .sort(
      (a, b) =>
        b.priorityScore - a.priorityScore ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  
  const total = prioritized.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  res.json({
    notifications: prioritized.slice(start, start + limit),
    total,
    totalPages,
    page,
    limit,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});