//import helper utils
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus, UserRoleConstant } = require("../utils/constant");


exports.designuploadCreate = async (req, res) => {
    try {
        if (!req.body._id) {
            let checkAlreadyUploaded = await dbMethods.findOne({
                collection: dbModels.DesignUpload,
                query: { name: req.body.name }
            });
            if (checkAlreadyUploaded) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .send(helperUtils.errorRes("Already uploaded", {}));
            }
            let fields = req.body
            fields.uploadedBy = req.user._id
            await dbMethods.insertOne({
                collection: dbModels.DesignUpload,
                document: fields
            })
        }
        else {
            let _id = req.body._id
            delete req.body._id
            let checkAlreadyUploaded = await dbMethods.findOne({
                collection: dbModels.DesignUpload,
                query: { name: req.body.name, _id: { $ne: _id } }
            });
            if (checkAlreadyUploaded) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .send(helperUtils.errorRes("Already uploaded", {}));
            }
            await dbMethods.updateOne({
                collection: dbModels.DesignUpload,
                query: { _id: _id },
                update: req.body
            })
        }
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully created", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.designuploadById = async (req, res) => {
    try {
        let designupload = await dbMethods.findOne({
            collection: dbModels.DesignUpload,
            query: { _id: req.params.id },
            populate: [
                { path: "image" },
                { path: "thumbnail" },
                { path: "category", select: "_id name" },
                { path: "uploadedBy", select: "name email" },
            ]
        })
        if (designupload.category) {
            designupload.category = {
                label: designupload.category.name,
                value: designupload.category._id
            }
        }
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get designupload", designupload));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.designuploadDelete = async (req, res) => {
    try {
        await dbMethods.deleteOne({
            collection: dbModels.DesignUpload,
            query: { _id: req.params.id }
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully deleted", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.designuploadList = async (req, res) => {
    try {
        let query = {}
        if (req?.user?.role == UserRoleConstant.Designer) {
            query.uploadedBy = req.user._id;
        }
        if (req.body.search) {
            query['$or'] = []
            query['$or'].push({ name: new RegExp(req.body.search, "i") });
            query['$or'].push({
                "tag": {
                    $elemMatch: { "label": new RegExp(req.body.search, 'i') }
                }
            })

        }
        let page = 1, limit = 10;
        if (req.body.page) page = req.body.page;
        if (req.body.limit) limit = req.body.limit;

        let result = await dbMethods.paginate({
            collection: dbModels.DesignUpload,
            query: query,
            options: {
                sort: { _id: -1 },
                populate: [
                    { path: "image" },
                    { path: "thumbnail" },
                    { path: "category", select: "name" },
                    { path: "uploadedBy", select: "name email" },
                ],
                lean: true
            }
        })
        let data = [];
        for (let i = 0; i < result.docs.length; i++) {
            const element = result.docs[i];

            if (element.category) {
                result.docs[i].category = {
                    label: result.docs[i].name,
                    value: result.docs[i]._id
                }
            }

        }

        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}