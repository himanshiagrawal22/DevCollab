const Task = require("../models/task");
const ProjectMember = require("../models/projectMember");

const createTask = async (req, res) => {
    const { projectId } = req.params;
    const {
        title,
        description,
        assignedTo,
        priority,
        dueDate
    } = req.body;

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
            message: "You are not allowed to create tasks"
        });
    }

    if (assignedTo) {
        const assignedMember = await ProjectMember.findOne({
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

    const task = await Task.create({
        title,
        description,
        project: projectId,
        assignedTo,
        createdBy: req.userId,
        priority,
        dueDate
    });

    return res.status(201).json({
        success: true,
        message: "Task created successfully",
        task
    });
};


const getProjectTasks = async (req, res) => {
    const { projectId } = req.params;

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

    const tasks = await Task.find({
        project: projectId
    })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");

    return res.status(200).json({
        success: true,
        tasks
    });
};


const updateTask = async (req, res) => {
    const { projectId, taskId } = req.params;

    const membership = await ProjectMember.findOne({
        project: projectId,
        user: req.userId
    });

    if (
        !membership ||
        !["OWNER", "ADMIN"].includes(membership.role)
    ) {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to update tasks"
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

    const { title, description, priority, assignedTo, dueDate } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    return res.status(200).json({
        success: true,
        message: "Task updated successfully",
        task
    });
};


const updateTaskStatus = async (req, res) => {
    const { projectId, taskId } = req.params;
    const { status } = req.body;

    const allowedStatus = ["TODO", "IN_PROGRESS", "DONE"];

    if (!allowedStatus.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid task status"
        });
    }

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

    task.status = status;

    await task.save();

    return res.status(200).json({
        success: true,
        message: "Task status updated successfully",
        task
    });
};

const deleteTask = async (req, res) => {
    const { projectId, taskId } = req.params;

    const membership = await ProjectMember.findOne({
        project: projectId,
        user: req.userId
    });

    if (
        !membership ||
        !["OWNER", "ADMIN"].includes(membership.role)
    ) {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to delete tasks"
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

    await task.deleteOne();

    return res.status(200).json({
        success: true,
        message: "Task deleted successfully"
    });
};

module.exports = {
    createTask,
    getProjectTasks,
    updateTask,
    updateTaskStatus, deleteTask
};