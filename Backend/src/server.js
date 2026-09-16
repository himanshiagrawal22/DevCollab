require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const app = require("./app");
const connectDB = require("./config/db");
const ProjectMember = require("./models/projectMember");

const PORT = process.env.PORT || 5000;

// =========================
// HTTP SERVER
// =========================

const server = http.createServer(app);

// =========================
// SOCKET.IO SERVER
// =========================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

// Controllers me req.app.get("io")
// se Socket.IO access karne ke liye
app.set("io", io);

// =========================
// SOCKET AUTH MIDDLEWARE
// =========================

io.use((socket, next) => {
  try {
    // Browser se Socket.IO handshake ke
    // saath cookies aati hain.
    const cookieHeader =
      socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(
        new Error("Authentication required")
      );
    }

    // Cookie header example:
    // token=abc123; otherCookie=value

    const cookies = {};

    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.trim().split("=");

      const key = parts.shift();
      const value = parts.join("=");

      if (key) {
        cookies[key] =
          decodeURIComponent(value);
      }
    });

    const token = cookies.token;

    if (!token) {
      return next(
        new Error("Authentication required")
      );
    }

    // JWT verify
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Same idea as req.userId
    // in REST auth middleware
    socket.userId = decoded.userId;

    next();
  } catch (error) {
    console.log(
      "Socket authentication failed:",
      error.message
    );

    next(
      new Error("Invalid or expired token")
    );
  }
});

// =========================
// SOCKET CONNECTION
// =========================

io.on("connection", (socket) => {
  console.log(
    "Authenticated socket connected:",
    socket.id,
    "User:",
    socket.userId
  );

  // =========================
  // JOIN PROJECT ROOM
  // =========================

  socket.on(
    "joinProject",
    async (projectId) => {
      try {
        // Check whether logged-in user
        // actually belongs to this project.

        const membership =
          await ProjectMember.findOne({
            project: projectId,
            user: socket.userId
          });

        if (!membership) {
          console.log(
            `Unauthorized room join attempt:
User ${socket.userId}
Project ${projectId}`
          );

          socket.emit(
            "projectJoinError",
            {
              message:
                "You are not a member of this project"
            }
          );

          return;
        }

        // Membership verified
        socket.join(projectId);

        console.log(
          `User ${socket.userId} joined project ${projectId}`
        );

        socket.emit(
          "projectJoined",
          {
            projectId
          }
        );
      } catch (error) {
        console.log(
          "Project room join error:",
          error.message
        );

        socket.emit(
          "projectJoinError",
          {
            message:
              "Failed to join project room"
          }
        );
      }
    }
  );

  // =========================
  // LEAVE PROJECT ROOM
  // =========================

  socket.on(
    "leaveProject",
    (projectId) => {
      socket.leave(projectId);

      console.log(
        `User ${socket.userId} left project ${projectId}`
      );
    }
  );

  // =========================
  // DISCONNECT
  // =========================

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );
  });
});

// =========================
// DATABASE CONNECTION
// =========================

connectDB();

// =========================
// START SERVER
// =========================

server.listen(PORT, () => {
  console.log(
    `DevCollab server running on port ${PORT}`
  );
});