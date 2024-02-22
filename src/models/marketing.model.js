const mongoose = require("mongoose");
const mongoosepaginate = require("mongoose-paginate-v2")

const marketingSchema = new mongoose.Schema({
    title: { type: String },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileUpload"
    },
    description: { type: String },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})
marketingSchema.plugin(mongoosepaginate)

exports.MarketingSchema = marketingSchema