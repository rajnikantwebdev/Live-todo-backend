const mongoose = require("mongoose")

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.DB_URI)
        console.log("DB connected")
    } catch (error) {
        console.log("Error in connecting with database, ", error)
    }
}

module.exports = { connectToDb }