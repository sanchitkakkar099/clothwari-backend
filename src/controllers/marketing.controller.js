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


exports.salespersonCreateEdit = async (req, res) => {
    try {
        if (!req.body._id) {
            let chekAlreadyAvail = await dbMethods.findOne({
                collection: dbModels.User,
                query: { email: req.body.email.toLowerCase() }
            })
            if (chekAlreadyAvail) {
                return res.send(helperUtils.errorRes(
                    "Already Available",
                    {},
                    HttpStatus.BAD_REQUEST
                ))
            }
            let createsalesperson = await dbMethods.insertOne({
                collection: dbModels.User,
                document: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.eamil.toLowerCase(),
                    password: await helperUtils.bcryptHash(req.body.password),
                    role: UserRoleConstant.SalesPerson,
                    phone: req.body.phone,
                    createdBy: req.user._id,
                    permissions: req.body.permissions
                }
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
        return helperUtils.successRes("Successfully created")
    } catch (error) {
        return res.send(helperUtils.errorRes("Bad Request", error.message, HttpStatus.BAD_REQUEST));
    }
}

exports.slaespersonById = async (req, res) => {
    try {
        let client = await dbMethods.findOne({
            collection: dbModels.User,
            query: { _id: req.params.id },
            project: { name: 1, email: 1, phone: 1, }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get client", client));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.slaespersondelete = async (req, res) => {
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

exports.salespersonList = async (req, res) => {
    try {
        let query = { role: UserRoleConstant.SalesPerson }
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
            project: { name: 1, email: 1, phone: 1, allowLoginTime: 1, allowLoginSec: 1, isDel: 1 },
            sort: { _id: -1 },
            populate: [{ path: "permissions" }]
        })

        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}