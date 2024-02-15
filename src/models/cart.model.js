const mongoose = require("mongoose");
const mongoosepaginate = require("mongoose-paginate-v2");

const CartSchema = new mongoose.Schema({
    design: [{
        designId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DesignUpload"
        },
        meter: { type: String }
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