const Task = require("../models/task");
const ProjectMember = require("../models/projectMember");
const Notification = require("../models/notification");
const ActivityLog = require("../models/activityLog");

// =========================
// CREATE TASK
// =========================

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;

    const {
      title,
      description,
      assignedTo,
      priority,
      dueDate
    } = req.body;

    const requesterMembership =
      await ProjectMember.findOne({
        project: projectId,
        user: req.userId
      });

    if (
      !requesterMembership ||
      !["OWNER", "ADMIN"].includes(
        requesterMembership.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create tasks"
      });
    }

    // Validate assignee
    if (assignedTo) {
      const assignedMember =
        await ProjectMember.findOne({
          project: projectId,
          user: assignedTo
        });

      if (!assignedMember) {
        return res.status(400).json({
          success: false,
          message: "Assigned user is not a project member"
        });
      }
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || undefined,
      createdBy: req.userId,
      priority,
      dueDate
    });

    const populatedTask = await Task.findById(
      task._id
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    const io = req.app.get("io");

    // =========================
    // TASK CREATED SOCKET
    // =========================

    if (io) {
      io.to(projectId).emit(
        "taskCreated",
        populatedTask
      );
    }

    // =========================
    // ACTIVITY LOG
    // =========================

    const activity = await ActivityLog.create({
      project: projectId,
      user: req.userId,
      task: task._id,
      type: "TASK_CREATED",
      message: `Created task "${task.title}"`
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

    // =========================
    // TASK ASSIGNMENT NOTIFICATION
    // =========================

    if (
      assignedTo &&
      assignedTo.toString() !== req.userId.toString()
    ) {
      const notification =
        await Notification.create({
          recipient: assignedTo,
          sender: req.userId,
          project: projectId,
          task: task._id,
          type: "TASK_ASSIGNED",
          message: `You were assigned to "${task.title}"`
        });

      const populatedNotification =
        await Notification.findById(
          notification._id
        )
          .populate("sender", "name email")
          .populate("project", "name")
          .populate("task", "title");

      if (io) {
        io.to(projectId).emit(
          "notificationCreated",
          populatedNotification
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while creating task"
    });
  }
};

// =========================
// GET PROJECT TASKS
// =========================

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const membership =
      await ProjectMember.findOne({
        project: projectId,
        user: req.userId
      });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a member of this project"
      });
    }

    const tasks = await Task.find({
      project: projectId
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      tasks
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching tasks"
    });
  }
};

// =========================
// UPDATE TASK
// =========================

const updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const membership =
      await ProjectMember.findOne({
        project: projectId,
        user: req.userId
      });

    if (
      !membership ||
      !["OWNER", "ADMIN"].includes(
        membership.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to update tasks"
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

    const {
      title,
      description,
      priority,
      assignedTo,
      dueDate
    } = req.body;

    const previousAssignedTo =
      task.assignedTo?.toString() || null;

    // Validate new assignee
    if (assignedTo) {
      const assignedMember =
        await ProjectMember.findOne({
          project: projectId,
          user: assignedTo
        });

      if (!assignedMember) {
        return res.status(400).json({
          success: false,
          message:
            "Assigned user is not a project member"
        });
      }
    }

    if (title !== undefined) {
      task.title = title;
    }

    if (description !== undefined) {
      task.description = description;
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (assignedTo !== undefined) {
      task.assignedTo = assignedTo || null;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate || null;
    }

    await task.save();

    const updatedTask = await Task.findById(
      task._id
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    const io = req.app.get("io");

    // =========================
    // TASK UPDATED SOCKET
    // =========================

    if (io) {
      io.to(projectId).emit(
        "taskUpdated",
        updatedTask
      );
    }

    // =========================
    // ACTIVITY LOG
    // =========================

    const activity = await ActivityLog.create({
      project: projectId,
      user: req.userId,
      task: task._id,
      type: "TASK_UPDATED",
      message: `Updated task "${task.title}"`
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

    // =========================
    // ASSIGNMENT CHANGE
    // =========================

    const newAssignedTo =
      task.assignedTo?.toString() || null;

    const assignmentChanged =
      assignedTo !== undefined &&
      newAssignedTo &&
      newAssignedTo !== previousAssignedTo;

    if (
      assignmentChanged &&
      newAssignedTo !== req.userId.toString()
    ) {
      const notification =
        await Notification.create({
          recipient: newAssignedTo,
          sender: req.userId,
          project: projectId,
          task: task._id,
          type: "TASK_ASSIGNED",
          message: `You were assigned to "${task.title}"`
        });

      const populatedNotification =
        await Notification.findById(
          notification._id
        )
          .populate("sender", "name email")
          .populate("project", "name")
          .populate("task", "title");

      if (io) {
        io.to(projectId).emit(
          "notificationCreated",
          populatedNotification
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating task"
    });
  }
};

// =========================
// UPDATE TASK STATUS
// =========================

const updateTaskStatus = async (
  req,
  res
) => {
  try {
    const { projectId, taskId } = req.params;
    const { status } = req.body;

    const allowedStatus = [
      "TODO",
      "IN_PROGRESS",
      "DONE"
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status"
      });
    }

    const membership =
      await ProjectMember.findOne({
        project: projectId,
        user: req.userId
      });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a member of this project"
      });
    }

    // =========================
    // VIEWER IS READ-ONLY
    // =========================

    if (membership.role === "VIEWER") {
      return res.status(403).json({
        success: false,
        message:
          "Viewers cannot update task status"
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

    task.status = status;

    await task.save();

    const updatedTask = await Task.findById(
      task._id
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    const io = req.app.get("io");

    // =========================
    // TASK STATUS SOCKET
    // =========================

    if (io) {
      io.to(projectId).emit(
        "taskUpdated",
        updatedTask
      );
    }

    // =========================
    // ACTIVITY LOG
    // =========================

    const activity = await ActivityLog.create({
      project: projectId,
      user: req.userId,
      task: task._id,
      type: "TASK_STATUS_CHANGED",
      message:
        `Changed "${task.title}" status to ${status}`
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
      message:
        "Task status updated successfully",
      task: updatedTask
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating task status"
    });
  }
};

// =========================
// DELETE TASK
// =========================

const deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const membership =
      await ProjectMember.findOne({
        project: projectId,
        user: req.userId
      });

    if (
      !membership ||
      !["OWNER", "ADMIN"].includes(
        membership.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete tasks"
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

    // Save title because task will be deleted
    const taskTitle = task.title;

    // =========================
    // ACTIVITY LOG
    // =========================
    // task reference intentionally omitted because
    // the task is about to be deleted.

    const activity = await ActivityLog.create({
      project: projectId,
      user: req.userId,
      type: "TASK_DELETED",
      message: `Deleted task "${taskTitle}"`
    });

    await task.deleteOne();

    const populatedActivity =
      await ActivityLog.findById(activity._id)
        .populate("user", "name email");

    const io = req.app.get("io");

    // =========================
    // SOCKET.IO
    // =========================

    if (io) {
      io.to(projectId).emit(
        "taskDeleted",
        taskId
      );

      io.to(projectId).emit(
        "activityCreated",
        populatedActivity
      );
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while deleting task"
    });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  updateTask,
  updateTaskStatus,
  deleteTask
};