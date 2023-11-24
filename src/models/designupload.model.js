const mongoose = require("mongoose");
const mongoosepaginate = require("mongoose-paginate-v2");

const DesignUploadSchema = new mongoose.Schema({
    name: { type: String },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    color: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Color'
    }],
    tag: [
        {
            customOption: { type: Boolean },
            label: { type: String },
            id: { type: String }
        }
    ],
    image: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileUpload"
    }],
    thumbnail: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileUpload"
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    designNo: { type: String }
}, { timestamps: true });

DesignUploadSchema.plugin(mongoosepaginate);

exports.DesignUploadSchema = DesignUploadSchema