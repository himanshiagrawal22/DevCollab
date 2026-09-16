const User = require("../models/user");
const Project = require("../models/project");
const ProjectMember = require("../models/projectMember");
const ActivityLog = require("../models/activityLog");

// =========================
// ADD MEMBER
// =========================

const addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

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
        message:
          "You are not allowed to add members"
      });
    }

    const allowedRoles = [
      "ADMIN",
      "MEMBER",
      "VIEWER"
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member role"
      });
    }

    if (
      role === "ADMIN" &&
      requesterMembership.role !== "OWNER"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only owner can add an admin"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User with this email is not registered"
      });
    }

    const existingMembership =
      await ProjectMember.findOne({
        project: projectId,
        user: user._id
      });

    if (existingMembership) {
      return res.status(409).json({
        success: false,
        message:
          "User is already a project member"
      });
    }

    const membership =
      await ProjectMember.create({
        project: projectId,
        user: user._id,
        role
      });

    const populatedMembership =
      await ProjectMember.findById(
        membership._id
      ).populate("user", "name email");

    const io = req.app.get("io");

    // =========================
    // MEMBER ADDED SOCKET
    // =========================

    if (io) {
      io.to(projectId).emit(
        "memberAdded",
        populatedMembership
      );
    }

    // =========================
    // ACTIVITY LOG
    // =========================

    const activity = await ActivityLog.create({
      project: projectId,
      user: req.userId,
      type: "MEMBER_ADDED",
      message:
        `Added ${user.name} as ${role}`
    });

    const populatedActivity =
      await ActivityLog.findById(activity._id)
        .populate("user", "name email");

    if (io) {
      io.to(projectId).emit(
        "activityCreated",
        populatedActivity
      );
    }

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      member: populatedMembership
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while adding member"
    });
  }
};

// =========================
// GET PROJECT MEMBERS
// =========================

const getProjectMembers = async (
  req,
  res
) => {
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

    const members =
      await ProjectMember.find({
        project: projectId
      })
        .populate("user", "name email")
        .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      members
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching members"
    });
  }
};

// =========================
// UPDATE MEMBER ROLE
// =========================

const updateMemberRole = async (
  req,
  res
) => {
  try {
    const {
      projectId,
      memberId
    } = req.params;

    const { role } = req.body;

    const requesterMembership =
      await ProjectMember.findOne({
        project: projectId,
        user: req.userId
      });

    if (
      !requesterMembership ||
      requesterMembership.role !== "OWNER"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only owner can update member roles"
      });
    }

    const allowedRoles = [
      "ADMIN",
      "MEMBER",
      "VIEWER"
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member role"
      });
    }

    const member =
      await ProjectMember.findOne({
        _id: memberId,
        project: projectId
      }).populate("user", "name email");

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    if (member.role === "OWNER") {
      return res.status(400).json({
        success: false,
        message:
          "Owner role cannot be changed"
      });
    }

    // Old role save kar lo before changing
    const previousRole = member.role;

    member.role = role;

    await member.save();

    const updatedMember =
      await ProjectMember.findById(
        member._id
      ).populate("user", "name email");

    const io = req.app.get("io");

    // =========================
    // MEMBER ROLE SOCKET
    // =========================

    if (io) {
      io.to(projectId).emit(
        "memberRoleUpdated",
        updatedMember
      );
    }

    // =========================
    // ACTIVITY LOG
    // =========================

    const activity = await ActivityLog.create({
      project: projectId,
      user: req.userId,
      type: "ROLE_CHANGED",
      message:
        `Changed ${updatedMember.user.name}'s role from ${previousRole} to ${role}`
    });

    const populatedActivity =
      await ActivityLog.findById(activity._id)
        .populate("user", "name email");

    if (io) {
      io.to(projectId).emit(
        "activityCreated",
        populatedActivity
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Member role updated successfully",
      member: updatedMember
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating member role"
    });
  }
};

// =========================
// REMOVE MEMBER
// =========================

const removeMember = async (req, res) => {
  try {
    const {
      projectId,
      memberId
    } = req.params;

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
        message:
          "You are not allowed to remove members"
      });
    }

    const member =
      await ProjectMember.findOne({
        _id: memberId,
        project: projectId
      }).populate("user", "name email");

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    if (member.role === "OWNER") {
      return res.status(400).json({
        success: false,
        message:
          "Project owner cannot be removed"
      });
    }

    if (
      requesterMembership.role === "ADMIN" &&
      member.role === "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin cannot remove another admin"
      });
    }

    // Member details save before deleting
    const removedMemberName =
      member.user?.name || "Member";

    const removedMemberRole = member.role;

    await member.deleteOne();

    const io = req.app.get("io");

    // =========================
    // MEMBER REMOVED SOCKET
    // =========================

    if (io) {
      io.to(projectId).emit(
        "memberRemoved",
        {
          memberId
        }
      );
    }

    // =========================
    // ACTIVITY LOG
    // =========================

    const activity = await ActivityLog.create({
      project: projectId,
      user: req.userId,
      type: "MEMBER_REMOVED",
      message:
        `Removed ${removedMemberName} (${removedMemberRole}) from the project`
    });

    const populatedActivity =
      await ActivityLog.findById(activity._id)
        .populate("user", "name email");

    if (io) {
      io.to(projectId).emit(
        "activityCreated",
        populatedActivity
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Member removed successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while removing member"
    });
  }
};

module.exports = {
  addMember,
  getProjectMembers,
  updateMemberRole,
  removeMember
};