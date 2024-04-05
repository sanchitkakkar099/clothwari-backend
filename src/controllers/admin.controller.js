//import helper utils
const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus, UserRoleConstant } = require("../utils/constant");
const ObjectId = require('mongoose').Types.ObjectId;

exports.adminCreateEdit = async (req, res) => {
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
            req.body.role = UserRoleConstant.Admin
            req.body.status = 1;
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


exports.adminById = async (req, res) => {
    try {
        let admin = await dbMethods.findOne({
            collection: dbModels.User,
            query: { _id: req.params.id },
            project: { name: 1, email: 1, phone: 1 },
            populate: [{ path: "permissions", select: "title module code" }]
        })

        if (admin.permissions) {
            admin.permissions = admin.permissions.map(e => {
                return {
                    _id: e._id,
                    label: e.title,
                    module: e.module,
                    value: e.code
                }
            })
        }
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get admin", admin));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.admindelete = async (req, res) => {
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

exports.adminList = async (req, res) => {
    try {
        let query = { role: UserRoleConstant.Admin }
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
            populate: [{ path: "permissions", select: "title module code" }],
            project: { name: 1, email: 1, phone: 1, isDel: 1 },
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


exports.getDashboardData = async (req, res) => {
    try {
        let staff = await dbMethods.countDocuments({
            collection: dbModels.User,
            query: { role: UserRoleConstant.Designer }
        })
        let query = {}
        if (req.user.role != UserRoleConstant.SuperAdmin) {
            query.uploadedBy = req.user._id
        }
        let uploaddesign = await dbMethods.countDocuments({
            collection: dbModels.DesignUpload,
            query: query
        })
        let uploaddesignIds = await dbMethods.distinct({
            collection: dbModels.DesignUpload,
            field: "_id",
            query: {}
        })
        let variantIds = await dbMethods.distinct({
            collection: dbModels.Variation,
            field: "_id",
            query: { designId: { $in: uploaddesignIds } },
        })
        let uploaddesignwithvariant = uploaddesignIds.length + variantIds.length
        let newStaff = await dbMethods.countDocuments({
            collection: dbModels.User,
            query: { role: UserRoleConstant.Designer, status: 0 }
        })
        let client = await dbMethods.countDocuments({
            collection: dbModels.User,
            query: { role: UserRoleConstant.Client }
        })
        let admin = await dbMethods.countDocuments({
            collection: dbModels.User,
            query: { role: UserRoleConstant.Admin }
        })

        let bagCountpipeline = [
            { $unwind: "$design" },
            {
                $group: {
                    _id: "",
                    count: { $sum: 1 }
                }
            }
        ]
        if (req.user.role == UserRoleConstant.Client) {
            bagCountpipeline.unshift({ $match: { userId: new ObjectId(req.user._id) } },)
        }
        let bagdata = await dbMethods.aggregate({
            collection: dbModels.Cart,
            pipeline: bagCountpipeline
        })
        let driveQ = {}
        if (req.user.role != UserRoleConstant.SuperAdmin) {
            driveQ.userId = req.user._id
        }
        let drive = await dbMethods.countDocuments({
            collection: dbModels.Drive,
            query: driveQ
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get data", {
                staff, uploaddesign, newStaff, client, admin,
                uploaddesignwithvariant,
                clientBagCount: bagdata && bagdata[0] ? bagdata[0].count : 0,
                drive: drive,
            }));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.approvalStaffList = async (req, res) => {
    try {
        let query = { role: UserRoleConstant.Designer, status: 0 }
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
            project: { name: 1, email: 1, phone: 1, onlyUpload: 1, status: 1 },
            sort: { _id: -1 },
        })

        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.approvedStaff = async (req, res) => {
    try {
        await dbMethods.updateOne({
            collection: dbModels.User,
            query: { _id: req.body.staffId },
            update: { status: req.body.status, permissions: req.body.permissions }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully updated", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}



exports.getpermissionlist = async (req, res) => {
    try {
        let pipeline = []
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

exports.client_design_addtocart_notfication = async (req, res) => {
    try {

        let count = await dbMethods.countDocuments({
            collection: dbModels.Cart,
            query: { adminView: false }
        })

        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get carts notifications", count));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.getclientcartdata = async (req, res) => {
    try {
        let page = (req.body.page) ? req.body.page : 0;
        let limit = (req.body.limit) ? req.body.limit : 10;
        let result = await dbMethods.paginate({
            collection: dbModels.Cart,
            query: {},
            options: {
                populate: [
                    { path: "design.designId", select: "name tag thumbnail", populate: { path: "thumbnail", select: "pdf_extract_img" } },
                    { path: "userId", select: "name email" }
                ],
                sort: { _id: -1 },
                page,
                limit
            }
        })

        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get carts notifications", result));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.user_deactivate = async (req, res) => {
    try {
        let user = await dbMethods.findOne({
            collection: dbModels.User,
            query: { _id: req.body.userId }
        })
        if (!user)
            return res.send(helperUtils.errorRes("User Not Found", {}, HttpStatus.BAD_REQUEST));

        await dbMethods.updateOne({
            collection: dbModels.User,
            query: { _id: req.body.userId },
            update: { isDel: req.body.isDel }
        })
        return res.send(helperUtils.successRes(`Successfully Deactivate ${user.role}`))
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.errorRes("Bad Request", error, HttpStatus.BAD_REQUEST));
    }
}

exports.readnotification = async (req, res) => {
    try {
        let cart = await dbMethods.findOne({
            collection: dbModels.Cart,
            query: { _id: req.body.notificationId }
        })
        if (!cart) {
            return res.status(HttpStatus.BAD_REQUEST)
                .send(helperUtils.errorRes("Not FOund", {}, HttpStatus.NOT_FOUND))
        }
        await dbMethods.updateOne({
            collection: dbModels.Cart,
            query: { _id: req.body.notificationId },
            update: { adminView: true }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully ready notification", {}))
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.adminLogin = async (req, res) => {
    try {
        let designer = await dbMethods.findOne({
            collection: dbModels.User,
            query: { _id: req.body.adminId },
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

exports.userpasswordchanges = async (req, res) => {
    try {
        let user = await dbMethods.findOne({
            collection: dbModels.User,
            query: { _id: req.body.userId }
        })
        if (!user) {
            return res.status(400)
                .send(helperUtils.errorRes("User Not Found", {}))
        }
        let password = await helperUtils.bcryptHash(req.body.password);
        await dbMethods.updateOne({
            collection: dbModels.User,
            query: { _id: user._id },
            update: { password: password }
        })
        return res.send(helperUtils.successRes("successfully changes password"))
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}