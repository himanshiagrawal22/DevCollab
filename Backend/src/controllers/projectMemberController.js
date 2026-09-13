const Project = require("../models/project");
const ProjectMember = require("../models/projectMember");
const User = require("../models/user");
const addMember = async (req, res) => {
    const { projectId } = req.params;
    const { email, role } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found"
        });
    }

    const requesterMembership = await ProjectMember.findOne({
        project: projectId,
        user: req.userId
    });

    if (
        !requesterMembership ||
        !["OWNER", "ADMIN"].includes(requesterMembership.role)
    ) {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to add members"
        });
    }

    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    const existingMember = await ProjectMember.findOne({
        project: projectId,
        user: userToAdd._id
    });

    if (existingMember) {
        return res.status(409).json({
            success: false,
            message: "User is already a member of this project"
        });
    }

    const newMember = await ProjectMember.create({
        project: projectId,
        user: userToAdd._id,
        role: role || "MEMBER"
    });

    return res.status(201).json({
        success: true,
        message: "Member added successfully",
        member: newMember
    });
};


const getProjectMembers = async (req, res) => {
    const { projectId } = req.params;

    const requesterMembership = await ProjectMember.findOne({
        project: projectId,
        user: req.userId
    });

    if (!requesterMembership) {
        return res.status(403).json({
            success: false,
            message: "You are not a member of this project"
        });
    }

    const members = await ProjectMember.find({
        project: projectId
    }).populate("user", "name email");

    return res.status(200).json({
        success: true,
        members
    });
};


const updateMemberRole = async (req, res) => {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    const allowedRoles = ["ADMIN", "MEMBER", "VIEWER"];

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid role"
        });
    }

    const requesterMembership = await ProjectMember.findOne({
        project: projectId,
        user: req.userId
    });

    if (!requesterMembership || requesterMembership.role !== "OWNER") {
        return res.status(403).json({
            success: false,
            message: "Only project owner can update member roles"
        });
    }

    const memberToUpdate = await ProjectMember.findOne({
        _id: memberId,
        project: projectId
    });

    if (!memberToUpdate) {
        return res.status(404).json({
            success: false,
            message: "Member not found in this project"
        });
    }

    if (memberToUpdate.role === "OWNER") {
        return res.status(403).json({
            success: false,
            message: "Owner role cannot be changed"
        });
    }

    memberToUpdate.role = role;

    await memberToUpdate.save();

    return res.status(200).json({
        success: true,
        message: "Member role updated successfully",
        member: memberToUpdate
    });
};


const removeMember = async (req, res) => {
    const { projectId, memberId } = req.params;

    const requesterMembership = await ProjectMember.findOne({
        project: projectId,
        user: req.userId
    });

    if (
        !requesterMembership ||
        !["OWNER", "ADMIN"].includes(requesterMembership.role)
    ) {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to remove members"
        });
    }

    const memberToRemove = await ProjectMember.findOne({
        _id: memberId,
        project: projectId
    });

    if (!memberToRemove) {
        return res.status(404).json({
            success: false,
            message: "Member not found in this project"
        });
    }

    if (memberToRemove.role === "OWNER") {
        return res.status(403).json({
            success: false,
            message: "Project owner cannot be removed"
        });
    }

    await memberToRemove.deleteOne();

    return res.status(200).json({
        success: true,
        message: "Member removed successfully"
    });
};


module.exports = {
    addMember,
    getProjectMembers,
    updateMemberRole,
    removeMember
};