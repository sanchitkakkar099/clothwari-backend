const mongoose = require("mongoose");
const mongoosepaginate = require("mongoose-paginate-v2");

const VariationSchema = new mongoose.Schema({
    color: { type: String },
    variation_name: { type: String },
    variation_designNo: { type: String },
    variation_image: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileUpload"
    }],
    variation_thumbnail: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileUpload"
    }],
    designId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DesignUpload"
    },
}, { timestamps: true });

VariationSchema.plugin(mongoosepaginate);

exports.VariationSchema = VariationSchema