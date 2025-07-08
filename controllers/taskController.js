const TaskSchema = require("../model/Task")
const { httpLogger } = require("../logger")

const createTask = async (req, res) => {
    try {
        const { title, description, assignedUser, status, priority } = req.body
        const task = new TaskSchema({ title, description, assignedUser, status, priority })
        const savedTask = await task.save()
        const populatedTask = await TaskSchema.findById(savedTask._id).populate("assignedUser", "-password");
        req.io.emit("task:created", populatedTask)

        httpLogger.log("info", {
            action: "create",
            actor: {
                username: req.user.username,
            },
            task: {
                title: populatedTask.title,
                status: populatedTask.status,
            },
        });

        res.status(201).json({ message: "Task created successfully!", task: "populatedTask" });
    } catch (error) {
        console.log("task creation: ", error)
        res.status(500).json({ message: "Unable to create task, please try again later." })
    }
}

const getTask = async (req, res) => {
    try {
        const todos = await TaskSchema.find().populate("assignedUser", "-password")
        res.status(200).json({ message: "Tasks fetched successfully", data: todos })

    } catch (error) {
        res.status(500).json({ message: "Unable to fetch tasks, please try again later." })
        console.log("getting todo error: ", error)
    }
}

const updateTask = async (req, res) => {
    try {
        const { id } = req.params
        const { title, description, assignedUser, status, priority } = req.body;
        const oldTask = await TaskSchema.findById(id);

        if (!oldTask) return res.status(404).json({ message: "Task not found" });
        const oldStatus = oldTask.status;

        const updatedTask = await TaskSchema.findByIdAndUpdate(
            id,
            { title, description, assignedUser, status, priority },
            { new: true }
        ).populate("assignedUser", "-password")

        httpLogger.log("info", {
            action: "edit",
            actor: {
                username: req.user.username,
            },
            task: {
                title: updatedTask.title,
                status: updatedTask.status,
            },
        });

        req.io.emit("task:updated", { updatedTask, oldStatus })
        res.status(204).json({ message: "Task updated successfully", data: updatedTask })
    } catch (error) {
        console.log("Error in updating the task, ", error)
        res.status(500).json({ message: "Unable to Edit Task, please try again later." })

    }
}

const deleteTask = (async (req, res) => {
    try {
        const { id } = req.params;
        const response = await TaskSchema.findByIdAndDelete(id).select("_id title status")
        res.status(200).json({ message: "Task deleted successfully", data: response })
        httpLogger.log("info", {
            action: "delete",
            actor: {
                username: req.user.username,
            },
            task: {
                title: response.title,
                status: response.status,
            },
        });
        req.io.emit("task:deleted", { taskStatus: response.status, taskId: response._id })
    } catch (error) {
        console.log("Unable to delete, pleae try again later", error)
        res.status(500).json({ message: "Unable to delete, please try again later" })
    }
})

const reAssignTask = (async (req, res) => {
    try {
        const { id } = req.params
        const { assignedUser } = req.body
        console.log("assignedUser ", id, assignedUser)
        const response = await TaskSchema.findByIdAndUpdate(id, { assignedUser }, { new: true }).populate("assignedUser", "-password").select("_id title status assignedUser")

        httpLogger.log("info", {
            action: "re-assign",
            actor: {
                username: req.user.username,
            },
            task: {
                title: response.title,
                status: response.status,
            },
        });

        req.io.emit("task:re-assigned", { taskStatus: response.status, taskId: response._id, assignedUser: response.assignedUser })
        res.status(200).json({ message: "Task re-assigned successfully", data: response })

    } catch (error) {
        console.log("Unable to delete, pleae try again later", error)
        res.status(500).json({ message: "Unable to re-assign, please try again later" })
    }
})

module.exports = { createTask, getTask, updateTask, deleteTask, reAssignTask }