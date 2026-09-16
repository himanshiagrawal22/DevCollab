const ActivityLog = require("../models/activityLog");
const ProjectMember = require("../models/projectMember");

// =========================
// GET PROJECT ACTIVITY LOGS
// =========================

const getProjectActivityLogs = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Logged-in user project ka member hona chahiye
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

    const activities = await ActivityLog.find({
      project: projectId
    })
      .populate("user", "name email")
      .populate("task", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      activities
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs"
    });
  }
};

module.exports = {
  getProjectActivityLogs
};