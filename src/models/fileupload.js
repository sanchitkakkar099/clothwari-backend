const mongoose = require("mongoose");

const FileuploadSchema = new mongoose.Schema({
    fieldname: { type: String },
    originalname: { type: String },
    encoding: { type: String },
    mimetype: { type: String },
    destination: { type: String },
    filename: { type: String },
    path: { type: String },
    size: { type: String },
    filepath: { type: String },
    pdf_extract_img: { type: String },
    thumbnail: { type: String },
    oldpath: { type: String },
    odls3: { type: String },
}, { timestamps: true })

exports.FileuploadSchema = FileuploadSchema;