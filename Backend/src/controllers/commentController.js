const Comment = require("../models/comment");
const Task = require("../models/task");
const ProjectMember = require("../models/projectMember");
const ActivityLog = require("../models/activityLog");

// =========================
// CREATE COMMENT
// =========================

const createComment = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required"
      });
    }

    // Check project membership
    const membership = await ProjectMember.findOne({
      project: projectId,
      user: req.userId
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project"
      });
    }

    // VIEWER is read-only
    if (membership.role === "VIEWER") {
      return res.status(403).json({
        success: false,
        message: "Viewers cannot add comments"
      });
    }

    // Check task
    const task = await Task.findOne({
      _id: taskId,
      project: projectId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Create comment
    const comment = await Comment.create({
      project: projectId,
      task: taskId,
      user: req.userId,
      text: text.trim()
    });

    const populatedComment = await Comment.findById(
      comment._id
    ).populate("user", "name email");

    const io = req.app.get("io");

    // =========================
    // COMMENT SOCKET
    // =========================

    if (io) {
      io.to(projectId).emit("commentAdded", {
        taskId,
        comment: populatedComment
      });
    }

    // =========================
    // ACTIVITY LOG
    // =========================

    const activity = await ActivityLog.create({
      project: projectId,
      user: req.userId,
      task: taskId,
      type: "COMMENT_ADDED",
      message: `Commented on "${task.title}"`
    });

    const populatedActivity =
      await ActivityLog.findById(activity._id)
        .populate("user", "name email")
        .populate("task", "title");

    if (io) {
      io.to(projectId).emit(
        "activityCreated",
        populatedActivity
      );
    }

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while adding comment"
    });
  }
};

// =========================
// GET COMMENTS
// =========================

const getTaskComments = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const membership = await ProjectMember.findOne({
      project: projectId,
      user: req.userId
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project"
      });
    }

    const task = await Task.findOne({
      _id: taskId,
      project: projectId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const comments = await Comment.find({
      project: projectId,
      task: taskId
    })
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      comments
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching comments"
    });
  }
};

// =========================
// DELETE COMMENT
// =========================

const deleteComment = async (req, res) => {
  try {
    const {
      projectId,
      taskId,
      commentId
    } = req.params;

    const membership = await ProjectMember.findOne({
      project: projectId,
      user: req.userId
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project"
      });
    }

    const task = await Task.findOne({
      _id: taskId,
      project: projectId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      project: projectId,
      task: taskId
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    const isCommentOwner =
      comment.user.toString() ===
      req.userId.toString();

    const isProjectManager =
      ["OWNER", "ADMIN"].includes(
        membership.role
      );

    if (!isCommentOwner && !isProjectManager) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this comment"
      });
    }

    await comment.deleteOne();

    const io = req.app.get("io");

    // =========================
    // COMMENT DELETED SOCKET
    // =========================

    if (io) {
      io.to(projectId).emit("commentDeleted", {
        taskId,
        commentId
      });
    }

    // =========================
    // ACTIVITY LOG
    // =========================

    const activity = await ActivityLog.create({
      project: projectId,
      user: req.userId,
      task: taskId,
      type: "COMMENT_DELETED",
      message: `Deleted a comment from "${task.title}"`
    });

    const populatedActivity =
      await ActivityLog.findById(activity._id)
        .populate("user", "name email")
        .populate("task", "title");

    if (io) {
      io.to(projectId).emit(
        "activityCreated",
        populatedActivity
      );
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while deleting comment"
    });
  }
};

module.exports = {
  createComment,
  getTaskComments,
  deleteComment
};