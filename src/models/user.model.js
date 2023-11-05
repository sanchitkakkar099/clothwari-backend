const mongoose = require("mongoose");
const mongoosepaginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema({
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    name: { type: String, default: "" }, //used for client
    phone: { type: String, default: "" },
    password: { type: String, default: "" },
    email: { type: String, default: "" },
    role: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
    onlyUpload: { type: Boolean, default: false, },
    Persmission: [{ type: String, default: "" }],
    isActive: { type: Boolean, default: false },
    allowLoginTime: { type: Date },   //only for cleint role
    allowLoginSec: { type: Number }   // only for client uer role

}, { timestamps: true })
userSchema.plugin(mongoosepaginate);

exports.userSchema = userSchema;