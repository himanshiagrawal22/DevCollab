const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null
    },

    type: {
      type: String,
      enum: [
        "TASK_CREATED",
        "TASK_UPDATED",
        "TASK_STATUS_CHANGED",
        "TASK_DELETED",
        "COMMENT_ADDED",
        "MEMBER_ADDED",
        "MEMBER_REMOVED",
        "ROLE_CHANGED"
      ],
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const ActivityLog = mongoose.model(
  "ActivityLog",
  activityLogSchema
);

module.exports = ActivityLog;