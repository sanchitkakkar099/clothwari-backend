const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");


const DriveSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    pdfurl: { type: String },
    pdfName: { type: String },
    ImagesPreviewsData: {
        type: Map,
        of: String
    },
    rowBackgroundsData: {
        type: Map,
        of: String
    },
    title: { type: String},
    typeOfPdf: { type: String},
    data: mongoose.Schema.Types.Mixed,
    isgen: { type: Boolean, default: false },
}, { timestamps: true, strict: false });

DriveSchema.plugin(mongoosePaginate);



exports.DriveSchema = DriveSchema;