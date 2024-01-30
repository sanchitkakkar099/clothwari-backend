const mongoose = require("mongoose");
const mongoosepaginate = require("mongoose-paginate-v2");

const CartSchema = new mongoose.Schema({
    designId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DesignUpload"
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    adminView: {
        type: Boolean, default: false
    }
}, { timestamps: true });

CartSchema.plugin(mongoosepaginate);

exports.CartSchema = CartSchema