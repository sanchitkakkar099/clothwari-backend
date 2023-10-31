const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");


const CategorySchema = new mongoose.Schema({
    name: { type: String }
}, { timestamps: true });

CategorySchema.plugin(mongoosePaginate);

const TagSchema = new mongoose.Schema({
    name: { type: String }
}, { timestamps: true });

TagSchema.plugin(mongoosePaginate)


exports.CategorySchema = CategorySchema;
exports.TagSchema = TagSchema;