//import helper utils
const { populate } = require("dotenv");
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
            if (req.body.from_time) req.body.from_time = new Date(req.body.from_time);
            if (req.body.to_time) req.body.to_time = new Date(req.body.to_time);
            if (checkAlreadyAvail) {
                return res.status(HttpStatus.BAD_REQUEST)
                    .send(helperUtils.errorRes("Email Already Exists", {}));
            }
            let createCustomerCode = await helperUtils.generateUniqueCustomerCode();

            req.body.password = await helperUtils.bcryptHash(req.body.password);
            req.body.createdBy = req.user._id
            req.body.role = UserRoleConstant.Client
            req.body.customerCode = createCustomerCode
            await dbMethods.insertOne({
                collection: dbModels.User,
                document: req.body
            })
        } else {
            let _id = req.body._id
            delete req.body._id

            if (req.body.from_time) req.body.from_time = new Date(req.body.from_time);
            if (req.body.to_time) req.body.to_time = new Date(req.body.to_time);
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
            project: { name: 1, email: 1, phone: 1, to_time: 1, from_time: 1 }
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
            project: { name: 1, email: 1, phone: 1, allowLoginTime: 1, allowLoginSec: 1, isDel: 1, customerCode: 1, from_time: 1, to_time: 1 },
            sort: { _id: -1 },
            populate: [{ path: "permissions" }]
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
        let { customerName, marketingPersonName, customerCode, salesOrderNumber } = req.body
        let query = [];

        let search = { $and: [] }
        if (customerName)
            search.$and.push({ customerName: new RegExp(customerName, "i") });

        if (marketingPersonName)
            search.$and.push({ marketingPersonName: new RegExp(marketingPersonName, "i") });

        if (customerCode)
            search.$and.push({ customerCode: new RegExp(customerCode, "i") });

        if (salesOrderNumber)
            search.$and.push({ salesOrderNumber: new RegExp(salesOrderNumber, "i") });

        if (search.$and.length) {
            query.unshift({
                $match: {
                    $and: search.$and
                }
            });
        }

        // Check if req.params.id is not an empty string
        if (req.user.role == UserRoleConstant.Client) {
            query.push({
                $match: { "clientId": new ObjectId(req.user._id) }
            });
        } else if (req.user.role == UserRoleConstant.SalesPerson) {
            query.push({
                $match: { "marketerId": new ObjectId(req.user._id) }
            })
        }


        query.push(
            {
                $project: {
                    userId: "$clientId",
                    customerName: 1,
                    customerCode: 1,
                    marketerId: 1,
                    byClient: 1,
                    marketingPersonName: 1,
                    salesOrderNumber: 1,
                    cartItem: 1
                }
            }
        )
        let data = await dbMethods.aggregate({
            collection: dbModels.Cart,
            pipeline: query
        })

        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let orderstaus = await dbMethods.findOne({
                collection: dbModels.CartEditReqStatus,
                query: { cartId: element._id },
                populate: [{ path: 'reviewedBy', select: 'name' }]
            })
            if (orderstaus) {
                data[i].status = orderstaus.status
                if (req.user.role == UserRoleConstant.SuperAdmin) data[i].reviewedBy = orderstaus?.reviewedBy
            } else data[i].status = ""

        }

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

exports.clientDesignById = async (req, res) => {
    try {
        let query = [
            {
                $match: { "_id": new ObjectId(req.params.id) }
            },
            {
                $unwind: "$cartItem"
            },
            {
                $lookup: {
                    from: "cartitems",
                    localField: "cartItem",
                    foreignField: "_id",
                    as: "cartItem"
                }
            },
            { $unwind: "$cartItem" },
            {
                $lookup: {
                    from: "fileuploads",
                    localField: "cartItem.thumbnail",
                    foreignField: "_id",
                    as: "cartItem.thumbnail"
                }
            },
            { $unwind: "$cartItem.thumbnail" },
            {
                $project: {
                    "cartItem._id": 1,
                    "cartItem.name": 1,
                    "cartItem.designNo": 1,
                    "cartItem.designId": 1,
                    "cartItem.variation": 1,
                    "cartItem.quantityPerCombo": 1,
                    "cartItem.yardage": 1,
                    "cartItem.fabricDetails": 1,
                    "cartItem.strikeRequired": 1,
                    "cartItem.sampleDeliveryDate": 1,
                    "cartItem.pricePerMeter": 1,
                    "cartItem.bulkOrderDeliveryDate": 1,
                    "cartItem.shipmentSampleDate": 1,
                    "cartItem.thumbnail": "$cartItem.thumbnail.pdf_extract_img",
                    userId: "$clientId",
                    customerName: 1,
                    customerCode: 1,
                    marketerId: 1,
                    byClient: 1,
                    marketingPersonName: 1,
                    salesOrderNumber: 1
                }
            }
        ];

        let data = await dbMethods.aggregate({
            collection: dbModels.Cart,
            pipeline: query
        });


        let page = (req.body.page) ? req.body.page : 1;
        let limit = (req.body.limit) ? (req.body.limit) : 10
        let client = {
            docs: data.slice((page - 1) * limit, page * limit),
            page: page,
            limit: limit,
            pages: Math.ceil(data.length / limit),
            total: data.length
        }
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get client design", client));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.clientLogin = async (req, res) => {
    try {
        let designer = await dbMethods.findOne({
            collection: dbModels.User,
            query: { _id: req.body.clientId },
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

exports.clientcartsave = async (req, res) => {
    try {
        let { cartItem } = req.body;
        itemIds = await dbMethods.insertMany({
            collection: dbModels.CartItem,
            documents: cartItem
        })
        itemIds = itemIds.map(e => e._id);
        delete req.body.cartItem
        req.body.cartItem = itemIds;
        let cart = await dbMethods.insertOne({
            collection: dbModels.Cart,
            document: req.body
        })
        if (cart && cart._id && !req.body.byClient) {
            await createclientorderreq(cart._id, itemIds, req.user._id)
        }
        return res.send(helperUtils.successRes("Successfully create cart", cart))

    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

async function createclientorderreq(cartId, cartItem, editor) {
    try {
        let items = await dbMethods.find({
            collection: dbModels.CartItem,
            query: { _id: { $in: cartItem } }
        })
        for (let i = 0; i < items.length; i++) {
            const element = items[i];
            let obj = {
                itemId: element._id,
                quantityPerCombo: element.quantityPerCombo,
                yardage: element.yardage,
                fabricDetails: element.fabricDetails,
                strikeRequired: element.strikeRequired,
                sampleDeliveryDate: element.sampleDeliveryDate,
                pricePerMeter: element.pricePerMeter,
                bulkOrderDeliveryDate: element.bulkOrderDeliveryDate,
                shipmentSampleDate: element.shipmentSampleDate,
            }
            await dbMethods.updateOne({
                collection: dbModels.CartItemEditReq,
                query: { itemId: element._id },
                update: obj,
                options: { new: true, upsert: true }
            })
        }
        await dbMethods.updateOne({
            collection: dbModels.CartEditReqStatus,
            query: { cartId: cartId },
            update: { editor: editor, status: "Pending", cartId: cartId },
            options: { new: true, upsert: true }
        })
        return true
    } catch (error) {
        return false;
    }
}

exports.clientdropdown = async (req, res) => {
    try {
        let query = { role: UserRoleConstant.Client }
        let clientlist = await dbMethods.find({
            collection: dbModels.User,
            query,
            project: { _id: 1, name: 1 }
        })
        return res.send(helperUtils.successRes("get list", clientlist))
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST)); F
    }
}

exports.orderUpdateByMarketer = async (req, res) => {
    try {
        for (let i = 0; i < req.body.cartItem.length; i++) {
            const element = req.body.cartItem[i];
            let alreadyAdded = await dbMethods.findOne({
                collection: dbModels.CartItemEditReq,
                query: { itemId: element._id }
            })
            let obj = {
                itemId: element._id,
                quantityPerCombo: element.quantityPerCombo,
                yardage: element.yardage,
                fabricDetails: element.fabricDetails,
                strikeRequired: element.strikeRequired,
                sampleDeliveryDate: element.sampleDeliveryDate,
                pricePerMeter: element.pricePerMeter,
                bulkOrderDeliveryDate: element.bulkOrderDeliveryDate,
                shipmentSampleDate: element.shipmentSampleDate,
            }
            await dbMethods.updateOne({
                collection: dbModels.CartItemEditReq,
                query: { itemId: element._id },
                update: obj,
                options: { new: true, upsert: true }
            })
        }
        await dbMethods.updateOne({
            collection: dbModels.CartEditReqStatus,
            query: { cartId: req.body._id },
            update: { editor: req.user._id, status: "Pending", cartId: req.body._id },
            options: { new: true, upsert: true }
        })
        return res.send(helperUtils.successRes("Successfullly updated", {}));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.ordereditrequestlist = async (req, res) => {
    try {

        let data = await dbMethods.paginate({
            collection: dbModels.CartEditReqStatus,
            query: {},
            options: {
                populate: [{ path: "cartId" }],
                sort: { _id: -1 },
                page: req.body.page ? req.body.page : 1,
                limit: req.body.limit ? req.body.limit : 10
            }
        })
        return res.send(helperUtils.successRes("successfully get list", data));
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.clientDesignEditReqById = async (req, res) => {
    try {
        let query = [
            {
                $match: { "_id": new ObjectId(req.params.id) }
            },
            {
                $unwind: "$cartItem"
            },
            {
                $lookup: {
                    from: "cartitems",
                    localField: "cartItem",
                    foreignField: "_id",
                    as: "cartItem"
                }
            },
            { $unwind: "$cartItem" },
            {
                $lookup: {
                    from: "fileuploads",
                    localField: "cartItem.thumbnail",
                    foreignField: "_id",
                    as: "cartItem.thumbnail"
                }
            },
            { $unwind: "$cartItem.thumbnail" },
            {
                $project: {
                    "cartItem._id": 1,
                    "cartItem.name": 1,
                    "cartItem.designNo": 1,
                    "cartItem.designId": 1,
                    "cartItem.variation": 1,
                    "cartItem.quantityPerCombo": 1,
                    "cartItem.yardage": 1,
                    "cartItem.fabricDetails": 1,
                    "cartItem.strikeRequired": 1,
                    "cartItem.sampleDeliveryDate": 1,
                    "cartItem.pricePerMeter": 1,
                    "cartItem.bulkOrderDeliveryDate": 1,
                    "cartItem.shipmentSampleDate": 1,
                    "cartItem.thumbnail": "$cartItem.thumbnail.pdf_extract_img",
                    userId: "$clientId",
                    customerName: 1,
                    customerCode: 1,
                    marketerId: 1,
                    byClient: 1,
                    marketingPersonName: 1,
                    salesOrderNumber: 1
                }
            }
        ];

        let data = await dbMethods.aggregate({
            collection: dbModels.Cart,
            pipeline: query
        });

        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let edititem = await dbMethods.findOne({
                collection: dbModels.CartItemEditReq,
                query: { itemId: element.cartItem._id }
            })
            if (edititem) {
                data[i]["cartItem"]["quantityPerCombo"] = edititem.quantityPerCombo;
                data[i]["cartItem"]["yardage"] = edititem.yardage;
                data[i]["cartItem"]["fabricDetails"] = edititem.fabricDetails;
                data[i]["cartItem"]["strikeRequired"] = edititem.strikeRequired;
                data[i]["cartItem"]["sampleDeliveryDate"] = edititem.sampleDeliveryDate;
                data[i]["cartItem"]["pricePerMeter"] = edititem.pricePerMeter;
                data[i]["cartItem"]["bulkOrderDeliveryDate"] = edititem.bulkOrderDeliveryDate;
                data[i]["cartItem"]["shipmentSampleDate"] = edititem.shipmentSampleDate;
            }
        }


        let page = (req.body.page) ? req.body.page : 1;
        let limit = (req.body.limit) ? (req.body.limit) : 10
        let client = {
            docs: data.slice((page - 1) * limit, page * limit),
            page: page,
            limit: limit,
            pages: Math.ceil(data.length / limit),
            total: data.length
        }
        return res.status(HttpStatus.OK)
            .send(helperUtils.successRes("Successfully get client design", client));
    } catch (error) {
        console.log(error)
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}


exports.orderdetailbyidV2 = async (req, res) => {
    try {
        let cart = await dbMethods.findOne({
            collection: dbModels.Cart,
            query: { _id: req.params.id },
            populate: [{ path: "cartItem", populate: { path: "thumbnail", select: "pdf_extract_img" } },
            ],
            options: { lean: true }
        })
        for (let i = 0; i < cart?.cartItem.length; i++) {
            const element = cart?.cartItem[i];
            let itemreq = await dbMethods.findOne({
                collection: dbModels.CartItemEditReq,
                query: { itemId: element._id }
            })
            if (itemreq) {
                cart.cartItem[i].quantityPerCombo = itemreq.quantityPerCombo;
                cart.cartItem[i].yardage = itemreq.yardage;
                cart.cartItem[i].fabricDetails = itemreq.fabricDetails;
                cart.cartItem[i].strikeRequired = itemreq.strikeRequired;
                cart.cartItem[i].sampleDeliveryDate = itemreq.sampleDeliveryDate;
                cart.cartItem[i].pricePerMeter = itemreq.pricePerMeter;
                cart.cartItem[i].bulkOrderDeliveryDate = itemreq.bulkOrderDeliveryDate;
                cart.cartItem[i].shipmentSampleDate = itemreq.shipmentSampleDate;
            }
        }
        return res.send(helperUtils.successRes("successfully get order detail", cart))
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}

exports.ordereditreqstatusupdate = async (req, res) => {
    try {
        await dbMethods.updateOne({
            collection: dbModels.CartEditReqStatus,
            query: { cartId: req.body.cartId },
            update: { status: req.body.status, reviewedBy: req.user._id }
        })
        if (req.body.status == "Approved") {
            //update  the requested value in oorder table
            let cart = await dbMethods.findOne({
                collection: dbModels.Cart,
                query: { _id: req.body.cartId }
            })
            for (let i = 0; i < cart?.cartItem?.length; i++) {
                let element = cart?.cartItem[i];
                let editreqValue = await dbMethods.findOne({
                    collection: dbModels.CartItemEditReq,
                    query: { itemId: element }
                })
                if (editreqValue) {
                    let obj = {
                        quantityPerCombo: editreqValue.quantityPerCombo,
                        yardage: editreqValue.yardage,
                        fabricDetails: editreqValue.fabricDetails,
                        strikeRequired: editreqValue.strikeRequired,
                        sampleDeliveryDate: editreqValue.sampleDeliveryDate,
                        pricePerMeter: editreqValue.pricePerMeter,
                        bulkOrderDeliveryDate: editreqValue.bulkOrderDeliveryDate,
                        shipmentSampleDate: editreqValue.shipmentSampleDate,
                    }
                    await dbMethods.updateOne({
                        collection: dbModels.CartItem,
                        query: { _id: element },
                        update: obj
                    })
                }
            }
        }
        return res.send(helperUtils.successRes(
            "successfully updated", {}))
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST)
            .send(helperUtils.successRes("Bad Request", {}, HttpStatus.BAD_REQUEST));
    }
}