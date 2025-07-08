const UserSchema = require("../model/User")
const bcrypt = require("bcrypt")
const jsonwebtoken = require("jsonwebtoken")

const userRegistration = async (req, res) => {
    try {
        const { username, password } = req.body;
        const isUserExist = await UserSchema.findOne({ username })
        console.log(username, password)
        if (isUserExist) {
            return res.status(400).json({ message: "User Exists, please Login" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new UserSchema({ username, password: hashedPassword })
        await user.save()

        res.status(201).json({ message: "User registered successfully, redirecitng to Login Page." })
    } catch (error) {
        console.log("register error: ", error)
        res.status(500).json({ message: "Unable to register user, please try again later" })
    }
}

const userLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await UserSchema.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: "User doesn't exist, please register" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken.sign({ username: user.username }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" })
        res.status(200).json({ message: "User login successful, redirecting to HomePage", token: token });

    } catch (error) {
        console.log("login error:", error);
        res.status(500).json({ message: "Login failed, please try again later" });
    }
};

const getUserList = (async (req, res) => {
    try {
        const userDetails = await UserSchema.find().select('-password')
        res.status(200).json({ message: "User list fetched successfully", userList: userDetails })
    } catch (error) {
        console.log("Unable to fetch user list", error);
        res.status(500).json({ message: "Unable to fetch user list" })
    }
})

const getUserTasksList = (async (req, res) => {
    try {
        const userTaskList = await UserSchema.aggregate([
            {
                $project: {
                    username: 1,
                    currentTasksCount: { $size: "$currentTasks" },
                },
            },
            {
                $sort: { currentTasksCount: 1 }
            },
            {
                $limit: 1
            }
        ]);
        res.status(200).json({ message: "Task list", data: userTaskList[0]._id })
    } catch (error) {
        console.log("error while fetching user task list ", error)
        res.status(500).json({ message: "Task list failed" })
    }
})

module.exports = { userRegistration, userLogin, getUserList, getUserTasksList }