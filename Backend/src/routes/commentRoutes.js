const express = require("express");

const {
  createComment,
  getTaskComments,
  deleteComment
} = require("../controllers/commentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/:projectId/tasks/:taskId/comments",
  protect,
  createComment
);

router.get(
  "/:projectId/tasks/:taskId/comments",
  protect,
  getTaskComments
);

router.delete(
  "/:projectId/tasks/:taskId/comments/:commentId",
  protect,
  deleteComment
);

module.exports = router;