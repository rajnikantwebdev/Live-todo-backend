const mongoose = require("mongoose")

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["Todo", "In-progress", "Done"],
        default: "Todo",
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium"
    }
}, { timestamps: true })

module.exports = mongoose.model("Task", TaskSchema)