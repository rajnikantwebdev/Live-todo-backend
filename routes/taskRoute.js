const express = require("express")
const router = express.Router()
const { createTask, getTask, updateTask, deleteTask, reAssignTask } = require("../controllers/taskController")
const { verifyAccessToken } = require("../middleware/authMiddleware")

router.post("/add", verifyAccessToken, createTask)
router.get("/get", getTask)
router.put("/update/:id", verifyAccessToken, updateTask)
router.delete("/delete/:id", verifyAccessToken, deleteTask)
router.put("/re-assign/:id", verifyAccessToken, reAssignTask)

module.exports = router