//import helper utils
const moment = require("moment");
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
            if (fields.color && fields.color.length) {
                fields.color = fields.color.map(e => e._id)
            }
            let design = await dbMethods.insertOne({
                collection: dbModels.DesignUpload,
                document: fields
            })

            for (let i = 0; i < req.body.variations.length; i++) {
                let ele = req.body.variations[i];
                ele.designId = design._id
                delete ele.id
                await dbMethods.insertOne({
                    collection: dbModels.Variation,
                    document: ele
                })

            }
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
            if (req.body.color && req.body.color.length) {
                req.body.color = req.body.color.map(e => e._id)
            }
            await dbMethods.updateOne({
                collection: dbModels.DesignUpload,
                query: { _id: _id },
                update: req.body
            })

            let oldids = await dbMethods.distinct({
                collection: dbModels.Variation,
                field: "_id",
                query: { designId: _id }
            })
            let currentids = []
            for (let i = 0; i < req.body.variations.length; i++) {
                let e = req.body.variations[i];
                if (!e._id) {
                    e.designId = _id
                    let variant = await dbMethods.insertOne({
                        collection: dbModels.Variation,
                        document: e
                    })
                    currentids.push(variant._id)
                } else {
                    await dbMethods.updateOne({
                        collection: dbModels.Variation,
                        query: { _id: e._id },
                        update: {
                            color: e.color,
                            variation_name: e.variation_name,
                            variation_designNo: e.variation_designNo,
                            variation_image: e?.variation_image,
                            variation_thumbnail: e?.variation_thumbnail
                        }
                    })
                    currentids.push(e._id);
                }
            }
            await dbMethods.deleteMany({
                collection: dbModels.Variation,
                query: { _id: { $nin: currentids }, designId: _id }
            })
        }
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully created", {}));
    } catch (error) {
        console.log(error);
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
        let pipeline = [
            {
                $match: {
                    _id: { $in: designupload.color }
                }
            },
            {
                $lookup: {
                    from: 'fileuploads',
                    localField: 'image',
                    foreignField: '_id',
                    as: 'image',
                }
            },
            {
                $unwind: { path: "$image", preserveNullAndEmptyArrays: true }
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
                $unwind: { path: "$thumbnail", preserveNullAndEmptyArrays: true }
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
        designupload.color = result
        designupload.variations = await dbMethods.find({
            collection: dbModels.Variation,
            query: { designId: designupload._id },
            populate: [{
                path: "variation_image",
            },
            {
                path: "variation_thumbnail"
            }]
        })
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
        if (req.body.uploadedBy) query.uploadedBy = req.body.uploadedBy;
        if (req.body.tags?.length) {
            query['tag.label'] = { $in: req.body.tags }
        }
        if (req.body.date_filter) {
            let date = req.body.date_filter.replace("+05:30", 'Z')
            query.createdAt = {
                $gte: new Date(moment(date).clone().startOf("day").toISOString()),
                $lte: new Date(moment(date).clone().endOf("day").toISOString())
            }
        }
        if (req.body.start_date && req.body.end_date) {
            req.body.start_date = req.body.start_date.replace("+05:30", 'Z')
            req.body.end_date = req.body.end_date.replace("+05:30", 'Z')
            query.createdAt = {
                $gte: new Date(moment(req.body.start_date).clone().startOf("day").toISOString()),
                $lte: new Date(moment(req.body.end_date).clone().endOf("day").toISOString())
            }
        }
        if (req.body.category?.length) {
            query['category'] = { $in: req.body.category }
        }
        if (req.body.color?.length) {
            query['color'] = { $in: req.body.color }
        }
        let page = 1, limit = 10;
        if (req.body.page) page = req.body.page;
        if (req.body.limit) limit = req.body.limit;

        let result = {};

        result = await dbMethods.paginate({
            collection: dbModels.DesignUpload,
            query: query,
            options: {
                populate: [
                    { path: "image", select: 'tif_extract_img' },
                    { path: "thumbnail", select: "pdf_extract_img" },
                    { path: "category", select: "name" },
                    { path: "uploadedBy", select: "name email" },
                ],
                sort: { _id: -1 },
                lean: true,
                page,
                limit,
            }
        })

        for (let i = 0; i < result.docs.length; i++) {
            const element = result.docs[i];

            if (element.category) {
                result.docs[i].category = {
                    label: result.docs[i].category.name,
                    value: result.docs[i].category._id
                }
            }
            if (element.color && element.color.length) {
                let pipeline = [
                    {
                        $match: {
                            _id: { $in: element.color }
                        }
                    },
                    {
                        $lookup: {
                            from: 'fileuploads',
                            localField: 'image',
                            foreignField: '_id',
                            as: 'image',
                        }
                    },
                    {
                        $unwind: { path: "$image", preserveNullAndEmptyArrays: true }
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
                        $unwind: { path: "$thumbnail", preserveNullAndEmptyArrays: true }
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
                let colors = await dbMethods.aggregate({
                    collection: dbModels.Color,
                    pipeline: pipeline
                })
                result.docs[i].color = colors
            } else {
                result.docs[i].color = []
            }
            result.docs[i].variations = await dbMethods.find({
                collection: dbModels.Variation,
                query: { designId: result.docs[i]._id },
                populate: [
                    {
                        path: "variation_image",
                        select: "tif_extract_img",
                    },
                    {
                        path: "variation_thumbnail",
                        select: "pdf_extract_img"
                    }]
            })
        }

        return res.status(HttpStatus.OK).send(helperUtils.successRes("Successfully get list", result));
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.designuploadCreateBulk = async (req, res) => {
    try {
        for (let i = 0; i < req.body.length; i++) {
            const element = req.body[i];

            if (!req.body._id) {
                let checkAlreadyUploaded = await dbMethods.findOne({
                    collection: dbModels.DesignUpload,
                    query: { name: element.name }
                });
                if (!checkAlreadyUploaded) {
                    let fields = element
                    delete fields.id
                    fields.uploadedBy = req.user._id
                    if (fields.color && fields.color.length) {
                        fields.color = fields.color.map(e => e._id)
                    }
                    await dbMethods.insertOne({
                        collection: dbModels.DesignUpload,
                        document: fields
                    })
                }

            }
            else {
                let _id = element._id
                delete element._id
                let checkAlreadyUploaded = await dbMethods.findOne({
                    collection: dbModels.DesignUpload,
                    query: { name: element.name, _id: { $ne: _id } }
                });
                if (!checkAlreadyUploaded) {
                    await dbMethods.updateOne({
                        collection: dbModels.DesignUpload,
                        query: { _id: _id },
                        update: element
                    })
                }

            }
        }
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully created", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.designuploadListwithpagination = async (req, res) => {
    try {
        let query = { $and: [] }
        // if (req?.user?.role == UserRoleConstant.Designer) {
        //     query.uploadedBy = req.user._id;
        // }
        if (req.body.name) {
            query.$and.push({ name: new RegExp(req.body.name, "i") })

        }

        if (req.body.uploadedBy) {
            let userIds = await dbMethods.distinct({
                collection: dbModels.User,
                field: "_id",
                query: { name: new RegExp(req.body.uploadedBy, "i") }
            })
            if (userIds.length) {
                query.$and.push({ uploadedBy: { $in: userIds } })

            } else {
                return res.send(helperUtils.successRes("successfully get list", {
                    docs: [],
                    "totalDocs": 0,
                    "limit": 10,
                    "totalPages": 1,
                    "page": 1,
                    "pagingCounter": 1,
                    "hasPrevPage": false,
                    "hasNextPage": true,
                    "prevPage": null,
                    "nextPage": 1

                }))
            }
        }
        if (req?.user?.role == UserRoleConstant.Designer) {
            query.uploadedBy = req.user._id;
        }

        if (req.body.category) {
            let categoryIds = await dbMethods.distinct({
                collection: dbModels.Category,
                field: "_id",
                query: { name: new RegExp(req.body.category, "i") }
            })
            if (categoryIds.length) {
                query.$and.push({ category: { $in: categoryIds } });
            } else {
                return res.send(helperUtils.successRes("successfully get list", {
                    docs: [],
                    "totalDocs": 0,
                    "limit": 10,
                    "totalPages": 1,
                    "page": 1,
                    "pagingCounter": 1,
                    "hasPrevPage": false,
                    "hasNextPage": true,
                    "prevPage": null,
                    "nextPage": 1

                }))
            }
        }
        let page = 1, limit = 10;
        if (req.body.page) page = req.body.page;
        if (req.body.limit) limit = req.body.limit;

        if (req.body.date_filter) {
            let date = req.body.date_filter.replace("+05:30", 'Z')
            query.$and.push({
                // createdAt: {
                //     $gte: new Date(req.body.date_filter).setHours(0, 0, 0, 0),
                //     $lte: new Date(req.body.date_filter).setHours(23, 59, 59, 0)
                // }
                createdAt: {
                    $gte: new Date(moment(date).clone().startOf("day").toISOString()),
                    $lte: new Date(moment(date).clone().endOf("day").toISOString())
                }
            })
        }
        if (req.body.start_date && req.body.end_date) {
            req.body.start_date = req.body.start_date.replace("+05:30", 'Z')
            req.body.end_date = req.body.end_date.replace("+05:30", 'Z')
            query.$and.push({
                createdAt: {
                    $gte: new Date(moment(req.body.start_date).clone().startOf("day").toISOString()),
                    $lte: new Date(moment(req.body.end_date).clone().endOf("day").toISOString())
                }
            })
        }

        if (query.$and.length == 0) delete query.$and

        let result = await dbMethods.paginate({
            collection: dbModels.DesignUpload,
            query: query,
            options: {
                select: { category: 1, uploadedBy: 1, name: 1, createdAt: 1 },
                populate: [
                    { path: "category", select: "name" },
                    { path: "uploadedBy", select: "name email" },
                ],
                sort: { _id: -1 },
                page,
                lean: true,
                limit,
            }
        })
        for (let i = 0; i < result.docs.length; i++) {
            const element = result.docs[i];

            if (element.category) {
                result.docs[i].category = {
                    label: result.docs[i].category.name,
                    value: result.docs[i].category._id
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


exports.checkdesginalreadyavail = async (req, res) => {
    try {
        let query = {}
        if (req.body.type == 1)
            query.name = { $regex: new RegExp("^" + req.body.value + "$", "i") };
        else
            query.designNo = { $regex: new RegExp("^" + req.body.value + "$", "i") };

        let design_name = await dbMethods.findOne({
            collection: dbModels.DesignUpload,
            query: query
        })
        if (design_name) {
            return res.status(HttpStatus.BAD_REQUEST)
                .send(helperUtils.errorRes("Already uploaded"))
        } else {
            return res.status(HttpStatus.OK)
                .send(helperUtils.successRes("Allow", {}))

        }
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.checkdesginalreadyavailvariant = async (req, res) => {
    try {
        let query = {}
        if (req.body.type == 1)
            query.variation_name = { $regex: new RegExp("^" + req.body.value + "$", "i") };
        else
            query.variation_designNo = { $regex: new RegExp("^" + req.body.value + "$", "i") };

        let design_name = await dbMethods.findOne({
            collection: dbModels.Variation,
            query: query
        })
        if (design_name) {
            return res.status(HttpStatus.BAD_REQUEST)
                .send(helperUtils.errorRes("Already uploaded"))
        } else {
            return res.status(HttpStatus.OK)
                .send(helperUtils.successRes("Allow", {}))
        }
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.setdesignimage = async (req, res) => {
    try {
        await dbMethods.updateOne({
            collection: dbModels.FileUpload,
            update: { pdf_extract_img: req.body.pdf_extract_img, isdirect_upload: true }
        })
        return res.send(helperUtils.successRes("Successfully uplaod the Design Image", {}));
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}