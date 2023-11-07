//import helper utils
const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus, UserRoleConstant } = require("../utils/constant");


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
        let client = await dbMethods.findOne({
            collection: dbModels.User,
            query: { _id: req.params.id },
            project: { name: 1, email: 1, phone: 1 }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get client", client));
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

        let result = await dbMethods.paginate({
            collection: dbModels.User,
            query: query,
            options: {
                select: { name: 1, email: 1, phone: 1 },
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


exports.getDashboardData = async (req, res) => {
    try {
        let staff = await dbMethods.countDocuments({
            collection: dbModels.User,
            query: { role: UserRoleConstant.Designer }
        })
        let uploaddesign = await dbMethods.countDocuments({
            collection: dbModels.DesignUpload,
            query: {}
        })
        let newStaff = await dbMethods.countDocuments({
            collection: dbModels.User,
            query: { role: UserRoleConstant.Designer, status: 0 }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get data", { staff, uploaddesign, newStaff }));
    } catch (error) {
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

        let result = await dbMethods.paginate({
            collection: dbModels.User,
            query: query,
            options: {
                select: { name: 1, email: 1, phone: 1, onlyUpload: 1, status: 1 },
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


exports.approvedStaff = async (req, res) => {
    try {
        await dbMethods.updateOne({
            collection: dbModels.User,
            query: { _id: req.body.staffId },
            update: { status: req.body.status }
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
        let permissions = await dbMethods.find({
            collection: dbModels.Permission,
            query: {},
            project: { title: 1, code: 1, module: 1 }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get permissions", permissions));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}
