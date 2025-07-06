const TaskSchema = require("../model/Task")

const createTask = async (req, res) => {
    try {
        const { title, description, assignedUser, status, priority } = req.body
        console.log(title, description, assignedUser, status, priority)
        const task = new TaskSchema({ title, description, assignedUser, status, priority })
        const savedTask = await task.save()
        const populatedTask = await TaskSchema.findById(savedTask._id).populate("assignedUser");

        req.io.emit("task:created", populatedTask)
        res.status(201).json({ message: "Task created successfully!", task: populatedTask });
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

const updateTask = async (req, res) => {
    try {
        const { id } = req.params
        const { title, description, assignedUser, status, priority } = req.body;

        const updatedData = {
            title: title,
            description: description,
            assignedUser: assignedUser,
            status: status,
            priority: priority
        }

        const updatedTodo = await TaskSchema.findByIdAndUpdate(id, updatedData)
        res.status(204).json({ message: "Todo updated successfully", data: updatedTodo })
    } catch (error) {
        console.log("Error in updating the task, ", error)
        res.status(500).json({ message: "Unable to Edit task, please try again later." })

    }
}

module.exports = { createTask, getTask, updateTask }