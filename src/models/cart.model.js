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
    },
    byClient: {
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
    editReqId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CartItemEditReq"
    }
}, { timestamps: true, strict: false });

const CartItemEditReqSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CartItemEditReq'
    },
    quantityPerCombo: { type: String },
    yardage: { type: String },
    fabricDetails: { type: String },
    strikeRequired: { type: String },
    sampleDeliveryDate: { type: Date },
    pricePerMeter: { type: String },
    bulkOrderDeliveryDate: { type: Date },
    shipmentSampleDate: { type: Date },
}, { timestamps: true, strict: false });

const CartEditReqStatusSchema = new mongoose.Schema({
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    editor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: { type: String, default: "Pending" },
    isClientApproved: { type: String, default: "Pending" },
}, { timestamps: true, strict: false });

CartSchema.plugin(mongoosepaginate);
CartItemSchema.plugin(mongoosepaginate);
CartEditReqStatusSchema.plugin(mongoosepaginate);

exports.CartSchema = CartSchema
exports.CartItemSchema = CartItemSchema
exports.CartItemEditReqSchema = CartItemEditReqSchema;
exports.CartEditReqStatusSchema = CartEditReqStatusSchema;