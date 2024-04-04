const mongoose = require("mongoose");
const mongoosepaginate = require("mongoose-paginate-v2");

const ZoneSchema = new mongoose.Schema({
    name: { type: String },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"

    }],
    staffs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"

    }
}, { timestamps: true });

ZoneSchema.plugin(mongoosepaginate);

exports.ZoneSchema = ZoneSchema