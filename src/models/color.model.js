const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");


const ColorSchema = new mongoose.Schema({
    name: { type: String },
    code: { type: String },
}, { timestamps: true });

ColorSchema.plugin(mongoosePaginate);


exports.ColorSchema = ColorSchema;