const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");


const ColorSchema = new mongoose.Schema({
    name: { type: String },
    code: { type: String },
    designNo: { type: String },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileUpload"
    },
    thumbnail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileUpload"
    },
}, { timestamps: true });

ColorSchema.plugin(mongoosePaginate);


exports.ColorSchema = ColorSchema;