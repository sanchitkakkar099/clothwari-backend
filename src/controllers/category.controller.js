
//import helper utils
const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus } = require("../utils/constant");

exports.categoryCreateEdit = async (req, res) => {
    try {
        if (!req.body._id) {
            let checkAlreadyAvail = await dbMethods.findOne({
                collection: dbModels.Category,
                query: { name: req.body.name }
            })
            if (checkAlreadyAvail) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .send(helperUtils.errorRes("Already Exists", {}))
            }
            await dbMethods.insertOne({
                collection: dbModels.Category,
                document: req.body
            })
        } else {
            await dbMethods.updateOne({
                collection: dbModels.Category,
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


exports.categoryById = async (req, res) => {
    try {
        let category = await dbMethods.findOne({
            collection: dbModels.Category,
            query: { _id: req.params.id }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get category", category));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.categorydelete = async (req, res) => {
    try {
        await dbMethods.deleteOne({
            collection: dbModels.Category,
            query: { _id: req.params.id }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully deleted", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.categoryList = async (req, res) => {
    try {
        let query = {}
        if (req.body.search) query['name'] = new RegExp(req.body.search, "i");
        let page = 1, limit = 10;
        if (req.body.page) page = req.body.page;
        if (req.body.limit) limit = req.body.limit;

        let result = {
            docs: [],
            hasNextPage: true,
            hasPrevPage: false,
            limit: 10,
            nextPage: 1,
            page: 1,
            pagingCounter: 1,
            prevPage: null,
            totalDocs: 0,
            totalPages: 1,
        };
        result.docs = await dbMethods.find({
            collection: dbModels.Category,
            query: query,
            sort: { _id: -1 },
        })

        result.totalDocs = result.docs.length;
        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.categoryDropDown = async (req, res) => {
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
            collection: dbModels.Category,
            pipeline: pipeline
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.checkcategory = async (req, res) => {
    try {
        //check already avail
        let category = await dbMethods.findOne({
            collection: dbModels.Category,
            query: { "name": { $regex: new RegExp("^" + req.body.name + "$", "i") } }
        })
        if (category) {
            return res.status(HttpStatus.BAD_REQUEST)
                .send(helperUtils.errorRes("Already uploaded"))
        } else {
            return res.status(HttpStatus.OK)
                .send(helperUtils.successRes("Allow", {}))

        }
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}