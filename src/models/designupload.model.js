const mongoose = require("mongoose");
const mongoosepaginate = require("mongoose-paginate-v2");

const DesignUploadSchema = new mongoose.Schema({
    name: { type: String },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    tag: [
        {
            customOption: { type: Boolean },
            label: { type: String },
            id: { type: String }
        }
    ],
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