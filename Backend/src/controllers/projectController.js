const Project = require("../models/project");
const ProjectMember = require("../models/projectMember");

const createProject = async (req, res) => {
    const { name, description } = req.body;

    const project = await Project.create({
        name,
        description,
        owner: req.userId
    });

    await ProjectMember.create({
        project: project._id,
        user: req.userId,
        role: "OWNER"
    });

    return res.status(201).json({
        success: true,
        message: "Project created successfully",
        project
    });
};

// =========================
// GET USER PROJECTS
// =========================

const getProjects = async (req, res) => {
  try {
    // Find every project where current user
    // has a membership
    const memberships = await ProjectMember.find({
      user: req.userId
    })
      .populate("project")
      .sort({ createdAt: -1 });

    // Remove memberships whose project
    // may no longer exist
    const projects = memberships
      .filter((membership) => membership.project)
      .map((membership) => ({
        ...membership.project.toObject(),
        role: membership.role
      }));

    return res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching projects"
    });
  }
};


const getProjectById = async (req, res) => {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found"
        });
    }

    if (project.owner.toString() !== req.userId) {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to access this project"
        });
    }

    return res.status(200).json({
        success: true,
        project
    });
};


const updateProject = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await Project.findById(id);
    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found"
        });
    }

    if (project.owner.toString() !== req.userId) {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to update this project"
        });
    }

    project.name = name;
    project.description = description;

    await project.save();

    return res.status(200).json({
        success: true,
        message: "Project updated successfully",
        project
    });
};

const deleteProject = async (req, res) => {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found"
        });
    }

    if (project.owner.toString() !== req.userId) {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to delete this project"
        });
    }

    await project.deleteOne();
    return res.status(200).json({
        success: true,
        message: "Project deleted successfully"
    });

}

module.exports = {
    createProject, getProjects, getProjectById,
    updateProject, deleteProject
};