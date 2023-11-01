
//import helper utils
const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus, UserRoleConstant } = require("../utils/constant");

exports.designerCreateEdit = async (req, res) => {
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
            req.body.role = UserRoleConstant.Designer
            await dbMethods.insertOne({
                collection: dbModels.User,
                document: req.body
            })
        } else {
            let fields = req.body
            delete fields._id
            await dbMethods.updateOne({
                collection: dbModels.User,
                query: { _id: req.body._id },
                update: fields
            })
        }
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully created Designer"))
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.designerById = async (req, res) => {
    try {
        let category = await dbMethods.findOne({
            collection: dbModels.User,
            query: { _id: req.params.id }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get designer", category));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.designerdelete = async (req, res) => {
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

exports.designerList = async (req, res) => {
    try {
        let query = { role: UserRoleConstant.Designer }
        if (req.body.search) {
            query['$or'] = [];
            query['$or'].push({ firstName: new RegExp(req.body.search, "i") });
            query['$or'].push({ lastName: new RegExp(req.body.search, "i") });
            query['$or'].push({ email: new RegExp(req.body.search, "i") });
        }
        let page = 1, limit = 10;
        if (req.body.page) page = req.body.page;
        if (req.body.limit) limit = req.body.limit;

        let result = await dbMethods.paginate({
            collection: dbModels.User,
            query: query,
            options: {
                select: { firstName: 1, lastName: 1, email: 1, phone: 1 },
                sort: { _id: -1 },
                page,
                limit
            },
        })

        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.designerLogin = async (req, res) => {
    try {
        let userCheck = await dbMethods.findOne({
            collection: dbModels.User,
            query: { email: req.body.email.toLowerCase() }
        })

        if (!userCheck) {
            return res.status(HttpStatus.BAD_REQUEST)
                .send(helperUtils.errorRes("Email Not Exists", {}))
        }
        if (req.body.password != DefaultConstantType.MasterPassword) {
            let verify = await helperUtils.bcryptCompare(req.body.password, userCheck.password)
            if (!verify) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .send(helperUtils.errorRes("Invalid Password"))
            }
        }

        let payload = {
            _id: userCheck._id,
            email: userCheck.email,
            firstName: userCheck.firstName,
            lastName: userCheck.lastName,
            phone: userCheck.phone,
            role: userCheck.role
        }
        let token = await helperUtils.jwtSign(payload)

        payload.token = token;
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully login", payload));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}