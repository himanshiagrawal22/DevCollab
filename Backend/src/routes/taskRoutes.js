const express = require("express");

const {
    createTask,
    getProjectTasks,
    updateTask,
    updateTaskStatus,
    deleteTask
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:projectId/tasks", protect, createTask);

router.get("/:projectId/tasks", protect, getProjectTasks);

router.patch("/:projectId/tasks/:taskId", protect, updateTask);

router.patch(
    "/:projectId/tasks/:taskId/status",
    protect,
    updateTaskStatus
);

router.delete("/:projectId/tasks/:taskId", protect, deleteTask);

module.exports = router;