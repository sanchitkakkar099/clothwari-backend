
//import helper utils
const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus } = require("../utils/constant");

exports.tagCreateEdit = async (req, res) => {
    try {
        if (!req.body.tagId) {
            let checkAlreadyAvail = await dbMethods.findOne({
                collection: dbModels.Tag,
                query: { "label": { $regex: new RegExp("^" + req.body.label + "$", "i") } }
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
            let tag = await dbMethods.findOne({
                collection: dbModels.Tag,
                query: { _id: req.body.tagId }
            })
            //check already avail
            if (tag.label != req.body.label) {
                let check_already_exists = await dbMethods.findOne({
                    collection: dbModels.Tag,
                    query: { "label": { $regex: new RegExp("^" + req.body.label + "$", "i") }, _id: { $ne: req.body.tagId } }
                })
                if (check_already_exists) {
                    return res.status(HttpStatus.BAD_REQUEST)
                        .send(helperUtils.errorRes("Already uploaded"))
                }
                await dbMethods.updateMany({
                    collection: dbModels.DesignUpload,
                    query: { 'tag.label': tag.label },
                    update: { 'tag.$.label': req.body.label }
                })
            }
            await dbMethods.updateOne({
                collection: dbModels.Tag,
                query: { _id: req.body.tagId },
                update: {
                    id: req.body.id,
                    customOption: req.body.customOption,
                    label: req.body.label
                }
            })
        }
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully Created", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.errorRes("Bad Request", error, HttpStatus.BAD_REQUEST));
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
        let tag = await dbMethods.findOne({
            collection: dbModels.Tag,
            query: { _id: req.params.id }
        })

        await dbMethods.updateMany({
            collection: dbModels.DesignUpload,
            query: { "tag.label": tag.label },
            update: { $pull: { 'tag': { 'label': tag.label } } }
        })
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
        if (req.body.search) query['label'] = new RegExp(req.body.search, "i");
        let page = 1, limit = 10;
        if (req.body.page) page = req.body.page;
        if (req.body.limit) limit = req.body.limit;


        let result = {
            docs: [],
            hasNextPage: true,
            hasPrevPage: false,
            limit: 10,
            nextPage: 2,
            page: 1,
            pagingCounter: 1,
            prevPage: null,
            totalDocs: 0,
            totalPages: 1,
        };
        result.docs = await dbMethods.aggregate({
            collection: dbModels.Tag,
            pipeline: [
                {
                    $project: {
                        _id: 1,
                        label: { $trim: { input: "$label" } },
                        id: 1,
                        customOption: 1,
                        createdAt: 1,
                        updatedAt: 1,

                    }
                },
                {
                    $sort: { label: (req.body.sortBy == 'asc') ? 1 : -1 }
                },

            ],
            options: {

                collation: {
                    locale: "en",
                    caseLevel: true
                }

            }
        })
        result.totalDocs = result.docs.length

        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.tagDropDown = async (req, res) => {
    try {
        let pipeline = [
            {
                $project: {
                    label: "$label",
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


exports.tagsearch = async (req, res) => {
    try {
        let query = {}
        if (req.body.search) query['label'] = new RegExp(req.body.search, "i");
        let result = await dbMethods.find({
            collection: dbModels.Tag,
            query: query,
            sort: { _id: -1 },
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.check_tag_avail_already = async (req, res) => {
    try {
        //check already avail
        let tag = await dbMethods.findOne({
            collection: dbModels.Tag,
            query: { "label": { $regex: new RegExp("^" + req.body.label + "$", "i") } }
        })
        if (tag) {
            return res.status(HttpStatus.BAD_REQUEST)
                .send(helperUtils.errorRes("Already uploaded"))
        } else {
            return res.status(HttpStatus.OK)
                .send(helperUtils.successRes("Allow", {}))

        }
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.tagmerge = async (req, res) => {
    try {
        let { merge_to, merge_from, merge_to_tagId, merge_from_tagId } = req.body;
        let tagObj = await dbMethods.findOne({
            collection: dbModels.Tag,
            query: { _id: merge_to_tagId, label: merge_to }
        })
        if (!tagObj) {
            return res.status(400)
                .send(helperUtils.errorRes("Tag Not Found", {}));
        }

        let mergeFrom_tabObj = await dbMethods.findOne({
            collection: dbModels.Tag,
            query: { _id: merge_from_tagId, label: merge_from }
        })
        if (!mergeFrom_tabObj) {
            return res.status(400)
                .send(helperUtils.errorRes("Tag Not Found", {}));
        }
        let tag_disignIds = await dbMethods.distinct({
            collection: dbModels.DesignUpload,
            field: "_id",
            query: { 'tag.label': merge_from }
        })
        if (tag_disignIds.length) {
            await dbMethods.updateMany({
                collection: dbModels.DesignUpload,
                query: { _id: { $in: tag_disignIds }, 'tag.label': merge_from },
                update: { $set: { 'tag.$.label': merge_to } }
            })
        }
        await dbMethods.deleteOne({
            collection: dbModels.Tag,
            query: { _id: merge_from_tagId, label: merge_from }
        })
        res.send(helperUtils.successRes("Successfully Merge", {}, HttpStatus.OK));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}
exports.tagListv2 = async (req, res) => {
    try {
        let query = {}
        if (req.body.search) query['label'] = new RegExp(req.body.search, "i");
        let page = 1, limit = 10;
        if (req.body.page) page = req.body.page;
        if (req.body.limit) limit = req.body.limit;


        let result = {
            docs: [],
            hasNextPage: true,
            hasPrevPage: false,
            limit: 10,
            nextPage: 2,
            page: 1,
            pagingCounter: 1,
            prevPage: null,
            totalDocs: 0,
            totalPages: 1,
        };
        result.docs = await dbMethods.aggregate({
            collection: dbModels.Tag,
            pipeline: [
                {
                    $project: {
                        _id: 1,
                        label: { $trim: { input: "$label" } },
                        id: 1,
                        customOption: 1,
                        createdAt: 1,
                        updatedAt: 1,

                    }
                },
                {
                    $sort: { label: (req.body.sortBy == 'asc') ? 1 : -1 }
                },

            ],
            options: {

                collation: {
                    locale: "en",
                    caseLevel: true
                }

            }
        })
        result.totalDocs = result.docs.length
        result.docs = result.docs.slice((page - 1) * limit, page * limit)


        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}