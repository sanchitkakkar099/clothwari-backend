
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
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.designerById = async (req, res) => {
    try {
        let designer = await dbMethods.findOne({
            collection: dbModels.User,
            query: { _id: req.params.id },
            populate: [{ path: "permissions" }],
            project: { name: 1, email: 1, phone: 1, onlyUpload: 1, permissions: 1 }
        })
        if (designer.permissions.length) {
            designer.permissions = designer?.permissions?.map(e => {
                return {
                    _id: e._id,
                    label: e.title,
                    module: e.module,
                    value: e.code
                }
            })
        }

        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get designer", designer));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", error.message, HttpStatus.BAD_REQUEST));
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
            populate: [{ path: "permissions" }],
            project: { name: 1, email: 1, phone: 1, onlyUpload: 1 },
            sort: { _id: -1 },
        })
        result.totalDocs = result.docs.length

        for (let i = 0; i < result.docs.length; i++) {
            if (result.docs[i] && result.docs[i].permissions) {
                result.docs[i].permissions = result.docs[i].permissions.map(e => {
                    return {
                        _id: e._id,
                        label: e.title,
                        module: e.module,
                        value: e.code
                    }
                })
            }
        }

        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.designerPermissionslist = async (req, res) => {
    try {
        // let permissions = await dbMethods.find({
        //     collection: dbModels.Permission,
        //     query: { module: "UploadDesign" },
        //     project: { title: 1, code: 1, module: 1 }
        // })
        let pipeline = []
        pipeline.push({
            $match: {
                module: "UploadDesign"
            }
        })
        pipeline.push({
            $project: {
                _id: 1,
                label: "$title",
                module: 1,
                value: "$code"
            }
        })
        // let permissions = await dbMethods.find({
        //     collection: dbModels.Permission,
        //     query: {},
        //     project: { title: 1, code: 1, module: 1 }
        // })
        let permissions = await dbMethods.aggregate({
            collection: dbModels.Permission,
            pipeline: pipeline,
            options: { lean: true }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get permissions", permissions));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.designerLogin = async (req, res) => {
    try {
        let designer = await dbMethods.findOne({
            collection: dbModels.User,
            query: { _id: req.body.designerById },
            populate: [{ path: "permissions" }],
        })

        let payload = {
            _id: designer._id,
            email: designer.email,
            name: designer.name,
            phone: designer.phone,
            role: designer.role,
            onlyUpload: designer.onlyUpload,
            permissions: designer?.permissions?.map(e => e.title),
        }
        let token = await helperUtils.jwtSign(payload)

        payload.token = token;
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully login", payload));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}