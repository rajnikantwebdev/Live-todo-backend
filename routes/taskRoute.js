const express = require("express")
const router = express.Router()
const { createTask } = require("../controllers/taskController")

router.post("/add", createTask)

module.exports = router