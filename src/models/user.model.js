const mongoose = require("mongoose");
const mongoosepaginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema({
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    phone: { type: String, default: "" },
    password: { type: String, default: "" },
    email: { type: String, default: "" },
    role: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
    onlyUpload: { type: Boolean },
    Persmission: [{ type: String, default: "" }]

}, { timestamps: true })
userSchema.plugin(mongoosepaginate);

exports.userSchema = userSchema;