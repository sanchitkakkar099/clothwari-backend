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
}, { timestamps: true })

exports.FileuploadSchema = FileuploadSchema;