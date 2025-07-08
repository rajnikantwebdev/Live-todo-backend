const express = require("express")
const router = express.Router()
const { userRegistration, userLogin, getUserList, getUserTasksList } = require("../controllers/authController")

router.post("/register", userRegistration)
router.post("/login", userLogin)
router.get("/list", getUserList)
router.get("/task/list", getUserTasksList)

module.exports = router