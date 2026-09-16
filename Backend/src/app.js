const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const projectMemberRoutes = require("./routes/projectMemberRoutes");
const taskRoutes = require("./routes/taskRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");

const app = express();

// =========================
// CLIENT URL
// =========================

const CLIENT_URL =
  process.env.CLIENT_URL ||
  "http://localhost:5173";

// =========================
// MIDDLEWARE
// =========================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(cookieParser());

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true
  })
);

// =========================
// ROUTES
// =========================

app.use("/api/auth", authRoutes);

app.use(
  "/api/projects",
  projectRoutes
);

app.use(
  "/api/projects",
  projectMemberRoutes
);

app.use(
  "/api/projects",
  taskRoutes
);

app.use(
  "/api/projects",
  commentRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/projects",
  activityLogRoutes
);

// =========================
// HEALTH CHECK
// =========================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DevCollab API is running"
  });
});

module.exports = app;