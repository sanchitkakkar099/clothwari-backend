const mongoose = require("mongoose");

const { dbModels } = require("../utils")
const { userSchema } = require("./user.model")
const { CategorySchema, TagSchema } = require("./category.model");
const { ColorSchema } = require("./color.model");
const { FileuploadSchema } = require("./fileupload");
const { DesignUploadSchema } = require("./designupload.model");
const { PermissionSchema } = require("./permission.model");
const { VariationSchema } = require("./variation.model");
const { CartSchema, CartItemSchema } = require("./cart.model")
const { MarketingSchema } = require("./marketing.model")
const { DriveSchema } = require("./drive.model");


const db = {


    Cart: mongoose.model(dbModels.Cart, CartSchema),
    CartItem: mongoose.model(dbModels.CartItem, CartItemSchema),
    Category: mongoose.model(dbModels.Category, CategorySchema),
    Color: mongoose.model(dbModels.Color, ColorSchema),
    DesignUpload: mongoose.model(dbModels.DesignUpload, DesignUploadSchema),
    Drive: mongoose.model(dbModels.Drive, DriveSchema),
    FileUpload: mongoose.model(dbModels.FileUpload, FileuploadSchema),
    Marketing: mongoose.model(dbModels.Marketing, MarketingSchema),
    Permission: mongoose.model(dbModels.Permission, PermissionSchema),
    Tag: mongoose.model(dbModels.Tag, TagSchema),
    User: mongoose.model(dbModels.User, userSchema),
    Variation: mongoose.model(dbModels.Variation, VariationSchema),
}


module.exports = db