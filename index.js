require("dotenv").config()
const express = require("express")
const app = express()
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const cors = require("cors")
const { connectToDb } = require("./connectDb")
const userRoutes = require("./routes/authRoute")
const taskRoutes = require("./routes/taskRoute")
const logsRoute = require("./routes/logsRoute")

connectToDb()

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "https://live-todo-frontend.vercel.app"]
    }
});

io.on("connection", (socket) => {
    console.log("server is up and running")
});

app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use("/api/user", userRoutes)
app.use("/api/task", taskRoutes)
app.use("/api", logsRoute)

app.get("/", (req, res) => {
    res.json({ message: "Server is Up and Running" })
})

httpServer.listen(8080);