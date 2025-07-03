const TaskSchema = require("../model/Task")

const createTask = async (req, res) => {
    try {
        const { title, description, assignedUser, status, priority } = req.body
        console.log(title, description, assignedUser, status, priority)
        const task = new TaskSchema({ title, description, assignedUser, status, priority })
        await task.save()

        res.status(201).json({ message: "Task created successfully!" })
    } catch (error) {
        console.log("task creation: ", error)
        res.status(500).json({ message: "Unable to create task, please try again later." })
    }
}

module.exports = { createTask }