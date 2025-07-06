const express = require("express")
const router = express.Router()
const { createTask, getTask, updateTask } = require("../controllers/taskController")

router.post("/add", createTask)
router.get("/get", getTask)
router.put("/update/:id", updateTask)

module.exports = router