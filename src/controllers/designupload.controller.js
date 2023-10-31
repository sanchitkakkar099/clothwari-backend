//import helper utils
const { dbMethods, dbModels, helperUtils } = require("../utils");
const { HttpStatus } = require("../utils/constant");


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
            let fields = req.body
            delete fields._id
            await dbMethods.updateOne({
                collection: dbModels.DesignUpload,
                query: { _id: req.body._id },
                update: fields
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
                { path: "thumbnail" }
            ]
        })
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get designupload", designupload));
    } catch (error) {
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
        if (req.body.search) query['name'] = new RegExp(req.body.search, "i");
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
                    { path: "thumbnail" }
                ],
            }
        })

        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}