//import helper utils
const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus, UserRoleConstant } = require("../utils/constant");
const ObjectId = require('mongoose').Types.ObjectId;


exports.clientCreateEdit = async (req, res) => {
    try {
        if (!req.body._id) {
            let checkAlreadyAvail = await dbMethods.findOne({
                collection: dbModels.User,
                query: { email: req.body.email.toLowerCase() }
            })
            if (checkAlreadyAvail) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .send(helperUtils.errorRes("Email Already Exists", {}));
            }
            req.body.password = await helperUtils.bcryptHash(req.body.password);
            req.body.createdBy = req.user._id
            req.body.role = UserRoleConstant.Client
            await dbMethods.insertOne({
                collection: dbModels.User,
                document: req.body
            })
        } else {
            let _id = req.body._id
            delete req.body._id

            //lets check email already  exists
            let emailcheck = await dbMethods.findOne({
                collection: dbModels.User,
                query: { email: req.body.email.toLowerCase(), _id: { $ne: _id } }
            })
            if (emailcheck) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .send(helperUtils.errorRes("Email Already Exists", {}));
            }
            await dbMethods.updateOne({
                collection: dbModels.User,
                query: { _id: _id },
                update: req.body
            })
        }
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully created Designer"))
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }

}


exports.clientById = async (req, res) => {
    try {
        let client = await dbMethods.findOne({
            collection: dbModels.User,
            query: { _id: req.params.id },
            project: { name: 1, email: 1, phone: 1, allowLoginTime: 1, allowLoginSec: 1, client_allow_time: 1 }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get client", client));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.clientdelete = async (req, res) => {
    try {
        await dbMethods.deleteOne({
            collection: dbModels.User,
            query: { _id: req.params.id }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully deleted", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.clientList = async (req, res) => {
    try {
        let query = { role: UserRoleConstant.Client }
        if (req.body.search) {
            query['$or'] = [];
            query['$or'].push({ name: new RegExp(req.body.search, "i") });
            query['$or'].push({ email: new RegExp(req.body.search, "i") });
        }
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
            collection: dbModels.User,
            query: query,
            project: { name: 1, email: 1, phone: 1, allowLoginTime: 1, allowLoginSec: 1 },
            sort: { _id: -1 },
        })

        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.clientaddTocart = async (req, res) => {
    try {
        await dbMethods.insertOne({
            collection: dbModels.Cart,
            document: {
                design: req.body.design,
                userId: req.user._id
            }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully added to cart", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.getmyagdesignlist = async (req, res) => {
    try {
        let query = [
            { $match: { "userId": new ObjectId(req.user._id) } },
            {
                $lookup: {
                    from: "designuploads",
                    localField: "design.designId",
                    foreignField: "_id",
                    as: "designId"
                }
            },
            { $unwind: "$design.designId" },
            {
                $lookup: {
                    from: "fileuploads",
                    localField: "design.designId.thumbnail",
                    foreignField: "_id",
                    as: "design.designId.thumbnail"
                }
            },
            {
                $project: {
                    userId: 1,
                    'designId.name': "$design.designId.name",
                    "designId.thumbnail": "$design.designId.thumbnail"
                }
            }
        ]
        let data = await dbMethods.aggregate({
            collection: dbModels.Cart,
            pipeline: query
        })

        let page = (req.body.page) ? req.body.page : 1;
        let limit = (req.body.limit) ? (req.body.limit) : 10
        let result = {
            docs: data.slice((page - 1) * limit, page * limit),
            page: page,
            limit: limit,
            pages: Math.ceil(data.length / limit),
            total: data.length
        }
        return res.send(helperUtils.successRes("Successfully get my cart design list", result))
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}