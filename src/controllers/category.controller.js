
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
            .send(helperUtils.successRes("Successfully Created", {}));
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
            sort: { name: (req.body.sortBy == 'desc') ? -1 : 1 },
            options: {
                collation: {
                    locale: "en",
                    caseLevel: true
                }
            }
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

exports.categorymerge = async (req, res) => {
    try {
        let { merge_from, merge_to } = req.body;
        let merge_to_ctegory = await dbMethods.findOne({
            collection: dbModels.Category,
            query: { _id: merge_to }
        })
        if (!merge_to_ctegory) {
            return res.status(400)
                .send(helperUtils.errorRes("Not Found", {}));
        }
        let category_disignIds = await dbMethods.distinct({
            collection: dbModels.DesignUpload,
            query: { category: merge_from },
            field: "_id"
        })
        if (category_disignIds.length) {
            await dbMethods.updateMany({
                collection: dbModels.DesignUpload,
                query: { _id: { $in: category_disignIds } },
                update: { $set: { category: merge_to } }
            })

            await dbMethods.deleteOne({
                collection: dbModels.Category,
                query: { _id: merge_from }
            })
        }
        return res.send(helperUtils.successRes("Successfully Merge Category", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.categoryListv2 = async (req, res) => {
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
            sort: { name: (req.body.sortBy == 'desc') ? -1 : 1 },
            options: {
                collation: {
                    locale: "en",
                    caseLevel: true
                }
            }
        })

        result.totalDocs = result.docs.length;
        result.docs = result.docs.slice((page - 1) * limit, page * limit)
        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}