require("dotenv").config()
const express = require("express")
const app = express()
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);

const { connectToDb } = require("./connectDb")
const userRoutes = require("./routes/authRoute")
const taskRoutes = require("./routes/taskRoute")
connectToDb()

const io = new Server(httpServer, { /* options */ });
io.on("connection", (socket) => {
    console.log("server is up and running")
});

app.use(express.json())
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use("/api/user", userRoutes)
app.use("/api/task", taskRoutes)

app.get("/", (req, res) => {
    res.json({ message: "Server is Up and Running" })
})

httpServer.listen(3000);