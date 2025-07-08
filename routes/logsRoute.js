const express = require("express")
const router = express.Router()
const { readLogs } = require("../controllers/loggerController")

router.get('/logs', readLogs)

module.exports = router;