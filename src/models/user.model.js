const mongoose = require("mongoose");
const mongoosepaginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    userName: { type: String },
    password: { type: String },
    role: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User" },

}, { timestamps: true })
userSchema.plugin(mongoosepaginate);

exports.userSchema = userSchema;