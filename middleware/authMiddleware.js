const jsonwebtoken = require("jsonwebtoken")

const verifyAccessToken = ((req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized access." });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized access." });
    }
})

module.exports = { verifyAccessToken }