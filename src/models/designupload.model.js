const mongoose = require("mongoose");
const mongoosepaginate = require("mongoose-paginate-v2");

const DesignUploadSchema = new mongoose.Schema({
    name: { type: String },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    tag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileUpload"
    },
    thumbnail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileUpload"
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    designNo: { type: Number }
}, { timestamps: true });

DesignUploadSchema.plugin(mongoosepaginate);

exports.DesignUploadSchema = DesignUploadSchema