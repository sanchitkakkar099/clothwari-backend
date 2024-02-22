//import helper utils
const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus, UserRoleConstant } = require("../utils/constant");

exports.marketingAdding = async (req, res) => {
    try {
        if (!req.body._id) {
            let checkAlreadAdded = await dbMethods.findOne({
                collection: dbModels.Marketing,
                query: { title: req.body.title }
            })
            if (checkAlreadAdded) {
                return res.send(helperUtils.errorRes("Already Exists", {}, HttpStatus.BAD_REQUEST));
            }
            await dbMethods.insertOne({
                collection: dbModels.Marketing,
                document: req.body
            })
            return res.send(helperUtils.successRes("Successfully uploaded to marketing"))
        } else {
            let { _id, ...data } = req.body
            let checkAlreadAdded = await dbMethods.findOne({
                collection: dbModels.Marketing,
                query: { title: req.body.title, _id: _id }
            })
            if (checkAlreadAdded) {
                return res.send(helperUtils.errorRes("Already Exists", {}, HttpStatus.BAD_REQUEST));
            }
            await dbMethods.updateOne({
                collection: dbModels.Marketing,
                query: { _id: _id },
                update: data
            })
        }
    } catch (error) {
        return res.send(helperUtils.errorRes("Bad Request", error.message, HttpStatus.BAD_REQUEST));
    }
}

exports.getMarketDataById = async (req, res) => {
    try {
        let market = await dbMethods.findOne({
            collection: dbModels.Marketing,
            query: { id: req.params.id },
            populate: [{ path: "image", select: "filepath pdf_extract_img" }]
        })
        return res.send(helperUtils.successRes("Successfully get the market data", market))
    } catch (error) {
        return res.send(helperUtils.errorRes("Bad Request", error.message, HttpStatus.BAD_REQUEST));
    }
}


exports.deleteMarketDataById = async (req, res) => {
    try {
        let market = await dbMethods.findOne({
            collection: dbModels.Marketing,
            query: { id: req.params.id }
        })
        if (market)
            await dbMethods.deleteOne({
                collection: dbModels.Marketing,
                query: { _id: req.params._id }
            })
        return res.send(helperUtils.successRes("Successfully delete market data", market))
    } catch (error) {
        return res.send(helperUtils.errorRes("Bad Request", error.message, HttpStatus.BAD_REQUEST));
    }
}

exports.marketingList = async (req, res) => {
    try {
        let query = {}
        if (req.body.search) query.title = new RegExp(req.body.search, 'i');
        let result = await dbMethods.paginate({
            collection: dbModels.Marketing,
            query,
            options: {
                populate: [
                    { path: "image", select: " filepath file_ pdf_extract_img" }
                ],
                page: req.body.page ? req.body.page : 1,
                limit: req.body.limit ? req.body.limit : 10,
                sort: { _id: -1 },
            }
        })
        return res.send(helperUtils.successRes("Successfully get the marketing list", result));
    } catch (error) {
        return res.send(helperUtils.errorRes("Bad Request", error.message, HttpStatus.BAD_REQUEST));
    }
}


