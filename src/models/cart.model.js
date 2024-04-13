const mongoose = require("mongoose");
const mongoosepaginate = require("mongoose-paginate-v2");

const CartSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    marketerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    salesOrderString: { type: String },
    customerCode: { type: String },
    cartItem: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CartItem'
    }],
    adminView: {
        type: Boolean, default: false
    }
}, { timestamps: true, strict: false });

const CartItemSchema = new mongoose.Schema({
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    name: { type: String },
    designNo: { type: String },
    thumbnail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FileUpload"
    },
    designId: mongoose.Schema.Types.Mixed,
    variation: { type: Boolean },
    quantityPerCombo: { type: String },
    yardage: { type: String },
    fabricDetails: { type: String },
    strikeRequired: { type: String },
    sampleDeliveryDate: { type: Date },
    pricePerMeter: { type: String },
    bulkOrderDeliveryDate: { type: Date },
    shipmentSampleDate: { type: Date },
}, { timestamps: true, strict: false });

CartSchema.plugin(mongoosepaginate);
CartItemSchema.plugin(mongoosepaginate);

exports.CartSchema = CartSchema
exports.CartItemSchema = CartItemSchema