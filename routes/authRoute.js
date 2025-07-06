const express = require("express")
const router = express.Router()
const { userRegistration, userLogin, getUserList } = require("../controllers/authController")

router.post("/register", userRegistration)
router.post("/login", userLogin)
router.get("/list", getUserList)
module.exports = router