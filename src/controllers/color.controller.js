
//import helper utils
const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus } = require("../utils/constant");

exports.colorCreateEdit = async (req, res) => {
    try {
        if (!req.body._id) {
            let checkAlreadyAvail = await dbMethods.findOne({
                collection: dbModels.Color,
                query: { code: req.body.code }
            })
            if (checkAlreadyAvail) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .send(helperUtils.errorRes("Already Exists", {}))
            }
            await dbMethods.insertOne({
                collection: dbModels.Color,
                document: req.body
            })
        } else {
            await dbMethods.updateOne({
                collection: dbModels.Color,
                query: { _id: req.body._id },
                update: { name: req.body.name, code: req.body.code }
            })
        }
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Suucessfullu Created", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.colorById = async (req, res) => {
    try {
        let color = await dbMethods.findOne({
            collection: dbModels.Color,
            query: { _id: req.params.id },
            populate: [
                { path: "image" },
                { path: "thumbnail" },
            ]
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get color", color));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.colordelete = async (req, res) => {
    try {
        await dbMethods.deleteOne({
            collection: dbModels.Color,
            query: { _id: req.params.id }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully deleted", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.colorList = async (req, res) => {
    try {
        let query = {}
        if (req.body.search) query['name'] = new RegExp(req.body.search, "i");
        let page = 1, limit = 10;
        if (req.body.page) page = req.body.page;
        if (req.body.limit) limit = req.body.limit;

        let result = await dbMethods.paginate({
            collection: dbModels.Color,
            query: query,
            options: {
                sort: { _id: -1 }, limit, page,
                populate: [
                    { path: "image" },
                    { path: "thumbnail" },
                ]
            }
        })

        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.colorDropDown = async (req, res) => {
    try {
        let pipeline = [
            {
                $lookup: {
                    from: 'fileuploads',
                    localField: 'image',
                    foreignField: '_id',
                    as: 'image',
                }
            },
            {
                $lookup: {
                    from: 'fileuploads',
                    localField: 'thumbnail',
                    foreignField: '_id',
                    as: 'thumbnail',
                }
            },
            {
                $project: {
                    _id: "$_id",
                    label: "$name",
                    value: "$code",
                    thumbnail: '$thumbnail',
                    image: '$image',
                    designNo: "designNo"

                }
            },
            {
                $sort: {
                    _id: -1
                }
            }
        ]
        let result = await dbMethods.aggregate({
            collection: dbModels.Color,
            pipeline: pipeline
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}