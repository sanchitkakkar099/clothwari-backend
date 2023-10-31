const mongoose = require("mongoose");

const { dbModels } = require("../utils")
const { userSchema } = require("./user.model")
const { CategorySchema, TagSchema } = require("./category.model");
const { FileuploadSchema } = require("./fileupload");
const { DesignUploadSchema } = require("./designupload.model");


const db = {


    Category: mongoose.model(dbModels.Category, CategorySchema),
    DesignUpload: mongoose.model(dbModels.DesignUpload, DesignUploadSchema),
    FileUpload: mongoose.model(dbModels.FileUpload, FileuploadSchema),
    Tag: mongoose.model(dbModels.Tag, TagSchema),
    User: mongoose.model(dbModels.User, userSchema),
}


module.exports = db