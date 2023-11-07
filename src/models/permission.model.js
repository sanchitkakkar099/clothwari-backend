const mongoose = require("mongoose");
const mongoosepaginate = require("mongoose-paginate-v2");

const PermissionSchema = new mongoose.Schema({
    title: { type: String },
    module: { type: String },
    code: { type: String }
}, { timestamps: true })

PermissionSchema.plugin(mongoosepaginate)

exports.PermissionSchema = PermissionSchema