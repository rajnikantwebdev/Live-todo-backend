const TaskSchema = require("../model/Task")

const createTask = async (req, res) => {
    try {
        const { title, description, assignedUser, status, priority } = req.body
        console.log(title, description, assignedUser, status, priority)
        const task = new TaskSchema({ title, description, assignedUser, status, priority })
        await task.save()

        req.io.emit("task:created", task)
        res.status(201).json({ message: "Task created successfully!" })
    } catch (error) {
        console.log("task creation: ", error)
        res.status(500).json({ message: "Unable to create task, please try again later." })
    }
}

const getTask = async (req, res) => {
    try {
        const todos = await TaskSchema.find().populate("assignedUser")

        res.status(200).json({ message: "Todos fetched successfully", data: todos })
    } catch (error) {
        console.log("getting todo error: ", error)
    }
}

module.exports = { createTask, getTask }