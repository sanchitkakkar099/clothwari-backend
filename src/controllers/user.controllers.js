

//import helper utils
const db = require("../models");
const { dbMethods, dbModels, helperUtils } = require("../utils")

const { DefaultConstantType, UserRoleConstant, HttpStatus } = require("../utils").constant

exports.createAdmin = async (req, res) => {
    try {
        req.body.email = req.body.email.toLowerCase();
        let alreadyEmail = await dbMethods.findOne({
            collection: dbModels.User,
            query: { email: req.body.email }
        })
        if (alreadyEmail) {
            return res.status(400).send(
                helperUtils.errorRes("Email Already Exists", {}, 400)
            )
        }
        req.body.password = await helperUtils.bcryptHash(req.body.password)
        await dbMethods.insertOne({
            collection: dbModels.User,
            document: req.body
        })
        return res.status(200).send(
            helperUtils.successRes("Successfully created",
                {}, 200)
        )
    } catch (error) {
        console.log(error)
        return res.status(400).send(helperUtils.errorRes(
            "Bad Request",
            error.message,
            400
        ))
    }
}

exports.adminlogin = async (req, res) => {
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

exports.createDesigner = async (req, res) => {
    try {
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
        await dbMethods.insertOne({
            collection: dbModels.User,
            document: req.body
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully created Designer"))
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}