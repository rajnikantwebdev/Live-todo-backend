const express = require("express")
const router = express.Router()
const { createTask, getTask } = require("../controllers/taskController")

router.post("/add", createTask)
router.get("/get", getTask)

module.exports = router