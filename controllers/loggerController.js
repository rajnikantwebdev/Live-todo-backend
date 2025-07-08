const fs = require("fs").promises;
const path = require("path");

async function readLogs(req, res) {
    try {
        const filePath = path.join(__dirname, "..", "public", "logger.log");
        const raw = await fs.readFile(filePath, "utf-8");

        const logs = raw
            .split("\n")
            .filter(Boolean)
            .map((line) => {
                try {
                    return JSON.parse(line);
                } catch (err) {
                    return { level: "error", message: "Failed to parse log", raw: line };
                }
            }).slice(-20).reverse()

        res.status(200).json({ message: "Logs fetched", data: logs });
    } catch (error) {
        console.error("Error reading log file:", error);
        res.status(500).json({ message: "Logs fetch failed" });
    }
}

module.exports = { readLogs };