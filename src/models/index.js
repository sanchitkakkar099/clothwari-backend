const mongoose = require("mongoose");

const { dbModels } = require("../utils")
const { userSchema } = require("./user.model")


const db = {

    User: mongoose.model(dbModels.User, userSchema)
}


module.exports = db