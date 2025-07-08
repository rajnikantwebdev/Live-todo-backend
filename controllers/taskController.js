const TaskSchema = require("../model/Task")
const { httpLogger } = require("../logger")
const dayjs = require("dayjs")
const UserSchema = require("../model/User")

const createTask = async (req, res) => {
    try {
        const { title, description, assignedUser, status, priority } = req.body
        const existingTask = await TaskSchema.find({ status: status }).select("title")

        const isDuplicate = existingTask.some(task =>
            title.trim().toLowerCase() === task.title.trim().toLowerCase()
        );

        if (isDuplicate) {
            return res.status(400).json({ message: "Task titles must be unique within a board" });
        }

        const task = new TaskSchema({ title, description, assignedUser, status, priority })
        const savedTask = await task.save()

        await UserSchema.findByIdAndUpdate(
            assignedUser,
            { $addToSet: { currentTasks: savedTask._id } }
        );

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

        if (req.io) {
            req.io.emit("log:update", {
                level: "info",
                timestamp: dayjs().format("MMM-DD-YYYY HH:mm:ss"),
                data: {
                    action: "create",
                    actor: {
                        username: req.user.username,
                    },
                    task: {
                        title: populatedTask.title,
                        status: populatedTask.status,
                    },
                }
            });
        }

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
        const { title, description, assignedUser, status, priority, dnd } = req.body;



        const oldTask = await TaskSchema.findById(id);

        if (!oldTask) return res.status(404).json({ message: "Task not found" });
        const oldStatus = oldTask.status;
        const oldAssignedUser = oldTask.assignedUser?.toString();
        console.log("old: ", oldAssignedUser)

        const updatedTask = await TaskSchema.findByIdAndUpdate(
            id,
            { title, description, assignedUser, status, priority },
            { new: true }
        ).populate("assignedUser", "-password")


        if (assignedUser && assignedUser !== oldAssignedUser) {
            if (oldAssignedUser) {
                await UserSchema.findByIdAndUpdate(oldAssignedUser, {
                    $pull: { currentTasks: id }
                })
            }

            await UserSchema.findByIdAndUpdate(assignedUser, {
                $addToSet: { currentTasks: id },
            });
        }

        httpLogger.log("info", {
            action: `${dnd}` ? "dragged and dropped" : "edit",
            actor: {
                username: req.user.username,
            },
            task: {
                title: updatedTask.title,
                status: updatedTask.status,
            },
        });

        req.io.emit("task:updated", { updatedTask, oldStatus })

        if (req.io) {
            req.io.emit("log:update", {
                level: "info",
                timestamp: dayjs().format("MMM-DD-YYYY HH:mm:ss"),
                data: {
                    action: `${dnd}` ? "dragged and dropped" : "edit",
                    actor: {
                        username: req.user.username,
                    },
                    task: {
                        title: updatedTask.title,
                        status: updatedTask.status,
                    },
                }
            });
        }

        res.status(200).json({ message: "Task updated successfully", data: updatedTask })
    } catch (error) {
        console.log("Error in updating the task, ", error)
        res.status(500).json({ message: "Unable to Edit Task, please try again later." })

    }
}

const deleteTask = (async (req, res) => {
    try {
        const { id } = req.params;
        const taskToDelete = await TaskSchema.findById(id).select("_id title status assignedUser");

        if (!taskToDelete) {
            return res.status(404).json({ message: "Task not found" });
        }

        await TaskSchema.findByIdAndDelete(id);

        if (taskToDelete.assignedUser) {
            await UserSchema.findByIdAndUpdate(taskToDelete.assignedUser, {
                $pull: { currentTasks: id },
            });
        }

        httpLogger.log("info", {
            action: "delete",
            actor: {
                username: req.user.username,
            },
            task: {
                title: taskToDelete.title,
                status: taskToDelete.status,
            },
        });

        if (req.io) {
            req.io.emit("log:update", {
                level: "info",
                timestamp: dayjs().format("MMM-DD-YYYY HH:mm:ss"),
                data: {
                    action: "delete",
                    actor: {
                        username: req.user.username,
                    },
                    task: {
                        title: taskToDelete.title,
                        status: taskToDelete.status,
                    },
                },
            });
        }

        req.io.emit("task:deleted", {
            taskStatus: taskToDelete.status,
            taskId: taskToDelete._id,
        });

        res.status(200).json({ message: "Task deleted successfully", data: taskToDelete });
    } catch (error) {
        console.log("Unable to delete, pleae try again later", error)
        res.status(500).json({ message: "Unable to delete, please try again later" })
    }
})

const reAssignTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedUser } = req.body;

        const oldTask = await TaskSchema.findById(id).select("assignedUser title status");

        if (!oldTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        const oldAssignedUser = oldTask.assignedUser?.toString();

        const updatedTask = await TaskSchema.findByIdAndUpdate(
            id,
            { assignedUser },
            { new: true }
        )
            .populate("assignedUser", "-password")
            .select("_id title status assignedUser");

        if (oldAssignedUser && oldAssignedUser !== assignedUser) {
            await UserSchema.findByIdAndUpdate(oldAssignedUser, {
                $pull: { currentTasks: id },
            });
        }

        if (assignedUser && assignedUser !== oldAssignedUser) {
            await UserSchema.findByIdAndUpdate(assignedUser, {
                $addToSet: { currentTasks: id },
            });
        }

        httpLogger.log("info", {
            action: "re-assign",
            actor: {
                username: req.user.username,
            },
            task: {
                title: updatedTask.title,
                status: updatedTask.status,
            },
        });

        if (req.io) {
            req.io.emit("log:update", {
                level: "info",
                timestamp: dayjs().format("MMM-DD-YYYY HH:mm:ss"),
                data: {
                    action: "re-assign",
                    actor: {
                        username: req.user.username,
                    },
                    task: {
                        title: updatedTask.title,
                        status: updatedTask.status,
                    },
                },
            });

            req.io.emit("task:re-assigned", {
                taskStatus: updatedTask.status,
                taskId: updatedTask._id,
                assignedUser: updatedTask.assignedUser,
            });
        }

        res.status(200).json({
            message: "Task re-assigned successfully",
            data: updatedTask,
        });
    } catch (error) {
        console.log("Unable to re-assign, please try again later", error);
        res.status(500).json({ message: "Unable to re-assign, please try again later" });
    }
};


module.exports = { createTask, getTask, updateTask, deleteTask, reAssignTask }