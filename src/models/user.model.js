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
    // onlyUpload: { type: Boolean, default: false, },
    isActive: { type: Boolean, default: false },
    allowLoginTime: { type: Date },   //only for cleint role
    allowLoginSec: { type: Number },   // only for client uer role
    status: { type: Number, default: 0 },   // used for designer 0:Pending 1:Approved 2:Rejected
    permissions: [{
        type: mongoose.Types.ObjectId,
        ref: "Permission"
    }],
    client_allow_time: mongoose.Schema.Types.Mixed,
    lastInActiveTime: { type: String },

}, { timestamps: true })
userSchema.plugin(mongoosepaginate);

exports.userSchema = userSchema;