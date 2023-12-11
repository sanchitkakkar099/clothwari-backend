
//import helper utils
const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus } = require("../utils/constant");

exports.tagCreateEdit = async (req, res) => {
    try {
        if (!req.body._id) {
            let checkAlreadyAvail = await dbMethods.findOne({
                collection: dbModels.Tag,
                query: { name: req.body.name }
            })
            if (checkAlreadyAvail) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .send(helperUtils.errorRes("Already Exists", {}))
            }
            await dbMethods.insertOne({
                collection: dbModels.Tag,
                document: req.body
            })
        } else {
            await dbMethods.updateOne({
                collection: dbModels.Tag,
                query: { _id: req.body._id },
                update: { name: req.body.name }
            })
        }
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Suucessfullu Created", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.tagById = async (req, res) => {
    try {
        let tag = await dbMethods.findOne({
            collection: dbModels.Tag,
            query: { _id: req.params.id }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get tag", tag));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.tagdelete = async (req, res) => {
    try {
        await dbMethods.deleteOne({
            collection: dbModels.Tag,
            query: { _id: req.params.id }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully deleted", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.tagList = async (req, res) => {
    try {
        let query = {}
        if (req.body.search) query['name'] = new RegExp(req.body.search, "i");
        let page = 1, limit = 10;
        if (req.body.page) page = req.body.page;
        if (req.body.limit) limit = req.body.limit;

        let result = await dbMethods.paginate({
            collection: dbModels.Tag,
            query: query,
            options: {
                sort: { _id: -1 },
                page: page,
                limit: limit,
            }
        })

        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.tagDropDown = async (req, res) => {
    try {
        let pipeline = [
            {
                $project: {
                    label: "$name",
                    value: "$_id"
                }
            },
            {
                $sort: {
                    _id: -1
                }
            }
        ]
        let result = await dbMethods.aggregate({
            collection: dbModels.Tag,
            pipeline: pipeline
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}